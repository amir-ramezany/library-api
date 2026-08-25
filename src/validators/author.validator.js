import AppError from "../utils/app-error.js";
import {
  assertAllowedFields,
  assertHasFields,
  assertObjectBody,
  readNonEmptyString,
  readNullableText,
} from "./common.validator.js";

const authorFields = new Set(["name", "biography"]);

const validateAuthorBody = (request, requireName) => {
  assertObjectBody(request.body);
  assertAllowedFields(request.body, authorFields);

  if (!requireName) {
    assertHasFields(request.body);
  }

  if (requireName && request.body.name === undefined) {
    throw new AppError(400, "name is required");
  }

  if (request.body.name !== undefined) {
    request.body.name = readNonEmptyString(request.body.name, "name", 255);
  }

  if (request.body.biography !== undefined) {
    request.body.biography = readNullableText(
      request.body.biography,
      "biography",
    );
  }
};

export const validateCreateAuthor = (request, response, next) => {
  validateAuthorBody(request, true);
  next();
};

export const validateUpdateAuthor = (request, response, next) => {
  validateAuthorBody(request, false);
  next();
};
