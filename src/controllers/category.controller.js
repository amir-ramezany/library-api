import * as categoryRepository from "../repositories/category.repository.js";
import AppError from "../utils/app-error.js";

export const getCategories = async (request, response) => {
  const categories = await categoryRepository.findCategories();

  response.status(200).json(categories);
};

export const getCategory = async (request, response) => {
  const category = await categoryRepository.findCategoryById(request.params.id);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  response.status(200).json(category);
};

export const createCategory = async (request, response) => {
  const category = await categoryRepository.createCategory(request.body);

  response.status(201).json(category);
};

export const updateCategory = async (request, response) => {
  const category = await categoryRepository.updateCategory(
    request.params.id,
    request.body,
  );

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  response.status(200).json(category);
};

export const deleteCategory = async (request, response) => {
  const wasDeleted = await categoryRepository.deleteCategory(request.params.id);

  if (!wasDeleted) {
    throw new AppError(404, "Category not found");
  }

  response.status(204).send();
};
