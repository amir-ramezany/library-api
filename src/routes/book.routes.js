import { Router } from "express";

import {
  addBookCategory,
  createBook,
  deleteBook,
  getBook,
  getBooks,
  removeBookCategory,
  updateBook,
} from "../controllers/book.controller.js";
import { validateBookQuery } from "../validators/book-query.validator.js";
import {
  validateCreateBook,
  validateUpdateBook,
} from "../validators/book.validator.js";
import { validateIdParams } from "../validators/common.validator.js";

const bookRouter = Router();

bookRouter
  .route("/")
  .get(validateBookQuery, getBooks)
  .post(validateCreateBook, createBook);
bookRouter
  .route("/:id")
  .all(validateIdParams({ id: "Book ID" }))
  .get(getBook)
  .patch(validateUpdateBook, updateBook)
  .delete(deleteBook);
bookRouter
  .route("/:bookId/categories/:categoryId")
  .all(
    validateIdParams({
      bookId: "Book ID",
      categoryId: "Category ID",
    }),
  )
  .put(addBookCategory)
  .delete(removeBookCategory);

export default bookRouter;
