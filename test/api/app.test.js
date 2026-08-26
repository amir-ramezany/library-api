import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import app from "../../src/app.js";
import pool from "../../src/config/db.js";

const originalPoolQuery = pool.query;
let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

afterEach(() => {
  pool.query = originalPoolQuery;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

const request = async (path, options) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = response.status === 204 ? null : await response.json();

  return { status: response.status, body };
};

test("GET /api/health returns the health response", async () => {
  const response = await request("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("unknown routes return the centralized 404 response", async () => {
  const response = await request("/api/unknown");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { message: "Route not found" });
});

test("malformed JSON returns a safe 400 response", async () => {
  const response = await request("/api/authors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{invalid",
  });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { message: "Invalid JSON body" });
});

test("invalid route parameters stop before database access", async () => {
  pool.query = async () => {
    throw new Error("The database should not be queried");
  };

  const response = await request("/api/books/not-a-number");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    message: "Book ID must be a positive integer",
  });
});

test("a valid author request reaches the repository and returns 201", async () => {
  pool.query = async (sql, values) => {
    assert.match(sql, /INSERT INTO authors/);
    assert.deepEqual(values, ["Octavia E. Butler", null]);

    return {
      rows: [
        {
          id: 1,
          name: values[0],
          biography: values[1],
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
  };

  const response = await request("/api/authors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "  Octavia E. Butler  " }),
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.name, "Octavia E. Butler");
});

test("book creation reports a missing related author", async () => {
  pool.query = async () => ({ rows: [] });

  const response = await request("/api/books", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "Kindred",
      isbn: "978-0-8070-8369-7",
      author_id: 999,
    }),
  });

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { message: "Author not found" });
});

test("PostgreSQL unique violations become conflict responses", async () => {
  pool.query = async () => {
    const error = new Error("Raw PostgreSQL duplicate detail");
    error.code = "23505";
    error.constraint = "categories_name_key";
    throw error;
  };

  const response = await request("/api/categories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Fantasy" }),
  });

  assert.equal(response.status, 409);
  assert.deepEqual(response.body, { message: "Category name already exists" });
});

test("attaching a category coordinates relationship repositories", async () => {
  let bookReadCount = 0;

  pool.query = async (sql) => {
    if (sql.includes("FROM books AS b")) {
      bookReadCount += 1;
      return {
        rows: [
          {
            id: 1,
            title: "1984",
            categories:
              bookReadCount === 1 ? [] : [{ id: 2, name: "Dystopian" }],
          },
        ],
      };
    }

    if (sql.includes("FROM categories")) {
      return { rows: [{ id: 2, name: "Dystopian" }] };
    }

    if (sql.includes("INSERT INTO book_categories")) {
      return { rows: [], rowCount: 1 };
    }

    throw new Error("Unexpected query");
  };

  const response = await request("/api/books/1/categories/2", {
    method: "PUT",
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.categories, [{ id: 2, name: "Dystopian" }]);
  assert.equal(bookReadCount, 2);
});
