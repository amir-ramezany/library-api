import assert from "node:assert/strict";
import { test } from "node:test";

import { validateBookQuery } from "../../src/validators/book-query.validator.js";
import {
  validateCreateBook,
  validateUpdateBook,
} from "../../src/validators/book.validator.js";
import { validateIdParams } from "../../src/validators/common.validator.js";

const next = () => {};

test("book creation normalizes an ISBN-13 and body values", () => {
  const request = {
    body: {
      title: "  Kindred  ",
      isbn: "978-0-8070-8369-7",
      description: "  A novel.  ",
      published_year: "1979",
      author_id: "3",
    },
  };

  validateCreateBook(request, {}, next);

  assert.deepEqual(request.body, {
    title: "Kindred",
    isbn: "9780807083697",
    description: "A novel.",
    published_year: 1979,
    author_id: 3,
  });
});

test("book creation accepts and normalizes a valid ISBN-10", () => {
  const request = {
    body: {
      title: "The Book",
      isbn: "0-306-40615-2",
      author_id: 1,
    },
  };

  validateCreateBook(request, {}, next);

  assert.equal(request.body.isbn, "0306406152");
});

test("an invalid ISBN checksum is rejected", () => {
  assert.throws(
    () =>
      validateCreateBook(
        {
          body: {
            title: "Invalid",
            isbn: "9780807083698",
            author_id: 1,
          },
        },
        {},
        next,
      ),
    (error) =>
      error.statusCode === 400 && error.message.includes("valid ISBN"),
  );
});

test("empty book updates are rejected", () => {
  assert.throws(
    () => validateUpdateBook({ body: {} }, {}, next),
    (error) => error.statusCode === 400 && error.message.includes("field"),
  );
});

test("book queries are validated and normalized", () => {
  const request = {
    query: {
      search: "  time travel  ",
      authorId: "3",
      category: "  Fiction  ",
      publishedYear: "1979",
      sortBy: "title",
      order: "DESC",
      page: "2",
      limit: "25",
    },
  };

  validateBookQuery(request, {}, next);

  assert.deepEqual(request.validatedQuery, {
    search: "time travel",
    authorId: 3,
    category: "Fiction",
    publishedYear: 1979,
    sortBy: "title",
    order: "desc",
    page: 2,
    limit: 25,
  });
});

test("unsupported sort fields are rejected", () => {
  assert.throws(
    () =>
      validateBookQuery(
        { query: { sortBy: "title; DROP TABLE books" } },
        {},
        next,
      ),
    (error) => error.statusCode === 400 && error.message.includes("sortBy"),
  );
});

test("route IDs outside the PostgreSQL integer range are rejected", () => {
  const validator = validateIdParams({ id: "Book ID" });

  assert.throws(
    () => validator({ params: { id: "2147483648" } }, {}, next),
    (error) => error.statusCode === 400 && error.message.includes("range"),
  );
});
