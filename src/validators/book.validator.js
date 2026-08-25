import AppError from "../utils/app-error.js";
import {
  assertAllowedFields,
  assertHasFields,
  assertObjectBody,
  readDatabaseId,
  readNonEmptyString,
  readNullableText,
  readPublicationYear,
} from "./common.validator.js";

const bookFields = new Set([
  "title",
  "isbn",
  "description",
  "published_year",
  "author_id",
]);

const isValidIsbn10 = (isbn) => {
  let checksum = 0;

  for (let index = 0; index < isbn.length; index += 1) {
    const character = isbn[index];
    const digit = character === "X" ? 10 : Number(character);
    checksum += digit * (10 - index);
  }

  return checksum % 11 === 0;
};

const isValidIsbn13 = (isbn) => {
  let checksum = 0;

  for (let index = 0; index < isbn.length; index += 1) {
    const multiplier = index % 2 === 0 ? 1 : 3;
    checksum += Number(isbn[index]) * multiplier;
  }

  return checksum % 10 === 0;
};

const readIsbn = (value) => {
  if (typeof value !== "string") {
    throw new AppError(400, "isbn must be a string");
  }

  const isbn = value.replace(/[\s-]/g, "").toUpperCase();
  const hasIsbn10Format = /^\d{9}[\dX]$/.test(isbn);
  const hasIsbn13Format = /^\d{13}$/.test(isbn);

  if (
    (!hasIsbn10Format || !isValidIsbn10(isbn)) &&
    (!hasIsbn13Format || !isValidIsbn13(isbn))
  ) {
    throw new AppError(400, "isbn must be a valid ISBN-10 or ISBN-13");
  }

  return isbn;
};

const validateBookBody = (request, requireFields) => {
  assertObjectBody(request.body);
  assertAllowedFields(request.body, bookFields);

  if (!requireFields) {
    assertHasFields(request.body);
  }

  if (requireFields) {
    for (const field of ["title", "isbn", "author_id"]) {
      if (request.body[field] === undefined) {
        throw new AppError(400, `${field} is required`);
      }
    }
  }

  if (request.body.title !== undefined) {
    request.body.title = readNonEmptyString(request.body.title, "title", 255);
  }

  if (request.body.isbn !== undefined) {
    request.body.isbn = readIsbn(request.body.isbn);
  }

  if (request.body.description !== undefined) {
    request.body.description = readNullableText(
      request.body.description,
      "description",
    );
  }

  if (request.body.published_year !== undefined) {
    request.body.published_year = readPublicationYear(
      request.body.published_year,
    );
  }

  if (request.body.author_id !== undefined) {
    request.body.author_id = readDatabaseId(
      request.body.author_id,
      "author_id",
    );
  }
};

export const validateCreateBook = (request, response, next) => {
  validateBookBody(request, true);
  next();
};

export const validateUpdateBook = (request, response, next) => {
  validateBookBody(request, false);
  next();
};
