import AppError from "../utils/app-error.js";
import {
  readDatabaseId,
  readNonEmptyString,
  readPositiveInteger,
  readPublicationYear,
} from "./common.validator.js";

const queryFields = new Set([
  "search",
  "authorId",
  "category",
  "publishedYear",
  "sortBy",
  "order",
  "page",
  "limit",
]);

const sortableFields = new Set([
  "id",
  "title",
  "isbn",
  "published_year",
  "created_at",
]);

const readQueryString = (value, label, maxLength) => {
  if (Array.isArray(value) || typeof value === "object") {
    throw new AppError(400, `${label} must have one value`);
  }

  return readNonEmptyString(value, label, maxLength);
};

export const validateBookQuery = (request, response, next) => {
  const unknownField = Object.keys(request.query).find(
    (field) => !queryFields.has(field),
  );

  if (unknownField) {
    throw new AppError(400, `Unsupported query parameter: ${unknownField}`);
  }

  const query = {
    page: request.query.page !== undefined
      ? readPositiveInteger(request.query.page, "page")
      : 1,
    limit: request.query.limit !== undefined
      ? readPositiveInteger(request.query.limit, "limit")
      : 10,
  };

  if (query.limit > 100) {
    throw new AppError(400, "limit must be at most 100");
  }

  if (request.query.search !== undefined) {
    query.search = readQueryString(request.query.search, "search", 200);
  }

  if (request.query.authorId !== undefined) {
    query.authorId = readDatabaseId(request.query.authorId, "authorId");
  }

  if (request.query.category !== undefined) {
    query.category = readQueryString(request.query.category, "category", 100);
  }

  if (request.query.publishedYear !== undefined) {
    query.publishedYear = readPublicationYear(
      request.query.publishedYear,
      "publishedYear",
    );
  }

  if (request.query.sortBy !== undefined) {
    const sortBy = readQueryString(request.query.sortBy, "sortBy", 50);

    if (!sortableFields.has(sortBy)) {
      throw new AppError(400, "sortBy is not supported");
    }

    query.sortBy = sortBy;
  }

  if (request.query.order !== undefined) {
    const order = readQueryString(request.query.order, "order", 10).toLowerCase();

    if (order !== "asc" && order !== "desc") {
      throw new AppError(400, "order must be asc or desc");
    }

    query.order = order;
  }

  request.validatedQuery = query;
  next();
};
