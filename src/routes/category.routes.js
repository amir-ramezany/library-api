import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.route("/").get(getCategories).post(createCategory);
categoryRouter
  .route("/:id")
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);

export default categoryRouter;
