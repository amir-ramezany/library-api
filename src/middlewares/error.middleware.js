import AppError from "../utils/app-error.js";

const getPostgresErrorResponse = (error) => {
  if (error.code === "23505") {
    if (error.constraint === "books_isbn_key") {
      return { statusCode: 409, message: "ISBN already exists" };
    }

    if (error.constraint === "categories_name_key") {
      return { statusCode: 409, message: "Category name already exists" };
    }

    return { statusCode: 409, message: "A unique value already exists" };
  }

  if (error.code === "23503") {
    return {
      statusCode: 409,
      message: "Operation conflicts with existing related data",
    };
  }

  if (error.code === "23502") {
    return { statusCode: 400, message: "A required value is missing" };
  }

  if (error.code === "23514") {
    return { statusCode: 400, message: "A value violates a database rule" };
  }

  if (error.code === "22P02") {
    return { statusCode: 400, message: "A value has an invalid format" };
  }

  if (error.code === "22001") {
    return { statusCode: 400, message: "A value exceeds its allowed length" };
  }

  return null;
};

const errorHandler = (error, request, response, next) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ message: "Invalid JSON body" });
  }

  const postgresError = getPostgresErrorResponse(error);

  if (postgresError) {
    return response
      .status(postgresError.statusCode)
      .json({ message: postgresError.message });
  }

  console.error(error);
  response.status(500).json({ message: "Internal server error" });
};

export default errorHandler;
