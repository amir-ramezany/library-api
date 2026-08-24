import { Router } from "express";

import {
  createAuthor,
  deleteAuthor,
  getAuthor,
  getAuthors,
  updateAuthor,
} from "../controllers/author.controller.js";

const authorRouter = Router();

authorRouter.route("/").get(getAuthors).post(createAuthor);
authorRouter.route("/:id").get(getAuthor).patch(updateAuthor).delete(deleteAuthor);

export default authorRouter;
