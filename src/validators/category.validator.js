import AppError from "../utils/app-error.js";
import {
  assertAllowedFields,
  assertHasFields,
  assertObjectBody,
  readNonEmptyString,
} from "./common.validator.js";

const categoryFields = new Set(["name"]);

const validateCategoryBody = (request, requireName) => {
  assertObjectBody(request.body);
  assertAllowedFields(request.body, categoryFields);

  if (!requireName) {
    assertHasFields(request.body);
  }

  if (requireName && request.body.name === undefined) {
    throw new AppError(400, "name is required");
  }

  if (request.body.name !== undefined) {
    request.body.name = readNonEmptyString(request.body.name, "name", 100);
  }
};

export const validateCreateCategory = (request, response, next) => {
  validateCategoryBody(request, true);
  next();
};

export const validateUpdateCategory = (request, response, next) => {
  validateCategoryBody(request, false);
  next();
};
