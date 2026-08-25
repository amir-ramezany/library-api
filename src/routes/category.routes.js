import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import {
  validateCreateCategory,
  validateUpdateCategory,
} from "../validators/category.validator.js";
import { validateIdParams } from "../validators/common.validator.js";

const categoryRouter = Router();

categoryRouter
  .route("/")
  .get(getCategories)
  .post(validateCreateCategory, createCategory);
categoryRouter
  .route("/:id")
  .all(validateIdParams({ id: "Category ID" }))
  .get(getCategory)
  .patch(validateUpdateCategory, updateCategory)
  .delete(deleteCategory);

export default categoryRouter;
