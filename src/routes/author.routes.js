import { Router } from "express";

import {
  createAuthor,
  deleteAuthor,
  getAuthor,
  getAuthors,
  updateAuthor,
} from "../controllers/author.controller.js";
import {
  validateCreateAuthor,
  validateUpdateAuthor,
} from "../validators/author.validator.js";
import { validateIdParams } from "../validators/common.validator.js";

const authorRouter = Router();

authorRouter.route("/").get(getAuthors).post(validateCreateAuthor, createAuthor);

authorRouter
  .route("/:id")
  .all(validateIdParams({ id: "Author ID" }))
  .get(getAuthor)
  .patch(validateUpdateAuthor, updateAuthor)
  .delete(deleteAuthor);

export default authorRouter;
