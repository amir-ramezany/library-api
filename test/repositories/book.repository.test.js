import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";

import pool from "../../src/config/db.js";
import { findBooks } from "../../src/repositories/book.repository.js";

const originalPoolQuery = pool.query;

afterEach(() => {
  pool.query = originalPoolQuery;
});

after(async () => {
  await pool.end();
});

test("combined book filters produce parameterized count and list queries", async () => {
  const calls = [];

  pool.query = async (sql, values) => {
    calls.push({ sql, values });

    if (sql.includes("COUNT(*)")) {
      return { rows: [{ total_items: "23" }] };
    }

    return { rows: [{ id: 26, title: "Kindred" }] };
  };

  const result = await findBooks({
    search: "time",
    authorId: 3,
    category: "Fiction",
    publishedYear: 1979,
    sortBy: "title",
    order: "desc",
    page: 2,
    limit: 25,
  });

  assert.equal(result.totalItems, 23);
  assert.equal(result.books[0].id, 26);
  assert.deepEqual(calls[0].values, ["%time%", 3, "Fiction", 1979]);
  assert.deepEqual(calls[1].values, ["%time%", 3, "Fiction", 1979, 25, 25]);
  assert.match(calls[0].sql, /EXISTS/);
  assert.match(calls[1].sql, /ORDER BY b\.title DESC/);
  assert.match(calls[1].sql, /LIMIT \$5/);
  assert.match(calls[1].sql, /OFFSET \$6/);
});

test("repository sorting still rejects untrusted column names", async () => {
  const calls = [];

  pool.query = async (sql, values) => {
    calls.push({ sql, values });
    return sql.includes("COUNT(*)")
      ? { rows: [{ total_items: "0" }] }
      : { rows: [] };
  };

  await findBooks({
    sortBy: "title; DROP TABLE books",
    order: "desc; DROP TABLE authors",
    page: 1,
    limit: 10,
  });

  assert.match(calls[1].sql, /ORDER BY b\.id ASC/);
  assert.doesNotMatch(calls[1].sql, /DROP TABLE/);
  assert.deepEqual(calls[1].values, [10, 0]);
});
