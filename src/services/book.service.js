import * as authorRepository from "../repositories/author.repository.js";
import * as bookRepository from "../repositories/book.repository.js";
import * as categoryRepository from "../repositories/category.repository.js";
import AppError from "../utils/app-error.js";

const findAuthorOrThrow = async (id) => {
  const author = await authorRepository.findAuthorById(id);

  if (!author) {
    throw new AppError(404, "Author not found");
  }

  return author;
};

const findBookOrThrow = async (id) => {
  const book = await bookRepository.findBookById(id);

  if (!book) {
    throw new AppError(404, "Book not found");
  }

  return book;
};

const findCategoryOrThrow = async (id) => {
  const category = await categoryRepository.findCategoryById(id);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return category;
};

export const createBook = async (bookData) => {
  await findAuthorOrThrow(bookData.author_id);

  return bookRepository.createBook(bookData);
};

export const updateBook = async (id, bookData) => {
  await findBookOrThrow(id);

  if (bookData.author_id !== undefined) {
    await findAuthorOrThrow(bookData.author_id);
  }

  const book = await bookRepository.updateBook(id, bookData);

  if (!book) {
    throw new AppError(404, "Book not found");
  }

  return book;
};

export const addCategoryToBook = async (bookId, categoryId) => {
  await findBookOrThrow(bookId);
  await findCategoryOrThrow(categoryId);

  await bookRepository.addCategoryToBook(bookId, categoryId);

  return bookRepository.findBookById(bookId);
};

export const removeCategoryFromBook = async (bookId, categoryId) => {
  await findBookOrThrow(bookId);
  await findCategoryOrThrow(categoryId);

  const removed = await bookRepository.removeCategoryFromBook(
    bookId,
    categoryId,
  );

  if (!removed) {
    throw new AppError(404, "Book category not found");
  }
};
