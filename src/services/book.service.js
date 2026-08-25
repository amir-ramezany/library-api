import * as authorRepository from "../repositories/author.repository.js";
import * as bookRepository from "../repositories/book.repository.js";
import * as categoryRepository from "../repositories/category.repository.js";
import AppError from "../utils/app-error.js";

export const createBook = async (bookData) => {
  const author = await authorRepository.findAuthorById(bookData.author_id);

  if (!author) {
    throw new AppError(404, "Author not found");
  }

  return bookRepository.createBook(bookData);
};

export const updateBook = async (id, bookData) => {
  const existingBook = await bookRepository.findBookById(id);

  if (!existingBook) {
    throw new AppError(404, "Book not found");
  }

  if (bookData.author_id !== undefined) {
    const author = await authorRepository.findAuthorById(bookData.author_id);

    if (!author) {
      throw new AppError(404, "Author not found");
    }
  }

  const book = await bookRepository.updateBook(id, bookData);

  if (!book) {
    throw new AppError(404, "Book not found");
  }

  return book;
};

export const addCategoryToBook = async (bookId, categoryId) => {
  const book = await bookRepository.findBookById(bookId);

  if (!book) {
    throw new AppError(404, "Book not found");
  }

  const category = await categoryRepository.findCategoryById(categoryId);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  await bookRepository.addCategoryToBook(bookId, categoryId);

  return bookRepository.findBookById(bookId);
};

export const removeCategoryFromBook = async (bookId, categoryId) => {
  const book = await bookRepository.findBookById(bookId);

  if (!book) {
    throw new AppError(404, "Book not found");
  }

  const category = await categoryRepository.findCategoryById(categoryId);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const removed = await bookRepository.removeCategoryFromBook(
    bookId,
    categoryId,
  );

  if (!removed) {
    throw new AppError(404, "Book category not found");
  }
};
