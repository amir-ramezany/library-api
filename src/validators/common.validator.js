import AppError from "../utils/app-error.js";

export const assertObjectBody = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError(400, "Request body must be a JSON object");
  }
};

export const assertAllowedFields = (body, allowedFields) => {
  const unknownField = Object.keys(body).find(
    (field) => !allowedFields.has(field),
  );

  if (unknownField) {
    throw new AppError(400, `Unknown field: ${unknownField}`);
  }
};

export const assertHasFields = (body) => {
  if (Object.keys(body).length === 0) {
    throw new AppError(400, "Request body must include a field to update");
  }
};

export const readNonEmptyString = (value, label, maxLength) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(400, `${label} must be a non-empty string`);
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length > maxLength) {
    throw new AppError(
      400,
      `${label} must be at most ${maxLength} characters`,
    );
  }

  return normalizedValue;
};

export const readNullableText = (value, label) => {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new AppError(400, `${label} must be a string or null`);
  }

  return value.trim();
};

export const readPositiveInteger = (value, label) => {
  const number = Number(value);

  if (!Number.isSafeInteger(number) || number < 1) {
    throw new AppError(400, `${label} must be a positive integer`);
  }

  return number;
};

export const readDatabaseId = (value, label) => {
  const id = readPositiveInteger(value, label);

  if (id > 2_147_483_647) {
    throw new AppError(400, `${label} is outside the supported range`);
  }

  return id;
};

export const readPublicationYear = (value, label = "published_year") => {
  if (value === null) {
    return null;
  }

  const year = Number(value);
  const currentYear = new Date().getFullYear();

  if (!Number.isInteger(year) || year < 1 || year > currentYear) {
    throw new AppError(
      400,
      `${label} must be an integer between 1 and ${currentYear}`,
    );
  }

  return year;
};

export const validateIdParams = (paramLabels) => {
  return (request, response, next) => {
    for (const [param, label] of Object.entries(paramLabels)) {
      request.params[param] = readDatabaseId(request.params[param], label);
    }

    next();
  };
};
