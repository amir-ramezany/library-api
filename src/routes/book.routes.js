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

const bookRouter = Router();

bookRouter.route("/").get(getBooks).post(createBook);
bookRouter.route("/:id").get(getBook).patch(updateBook).delete(deleteBook);
bookRouter
  .route("/:bookId/categories/:categoryId")
  .put(addBookCategory)
  .delete(removeBookCategory);

export default bookRouter;
