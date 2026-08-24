import * as authorRepository from "../repositories/author.repository.js";
import * as bookRepository from "../repositories/book.repository.js";
import * as categoryRepository from "../repositories/category.repository.js";

export const createBook = async (bookData) => {
  const author = await authorRepository.findAuthorById(bookData.author_id);

  if (!author) {
    return null;
  }

  return bookRepository.createBook(bookData);
};

export const updateBook = async (id, bookData) => {
  const existingBook = await bookRepository.findBookById(id);

  if (!existingBook) {
    return { book: null, reason: "book_not_found" };
  }

  if (bookData.author_id !== undefined) {
    const author = await authorRepository.findAuthorById(bookData.author_id);

    if (!author) {
      return { book: null, reason: "author_not_found" };
    }
  }

  const book = await bookRepository.updateBook(id, bookData);

  if (!book) {
    return { book: null, reason: "book_not_found" };
  }

  return { book, reason: null };
};

export const addCategoryToBook = async (bookId, categoryId) => {
  const book = await bookRepository.findBookById(bookId);

  if (!book) {
    return { book: null, reason: "book_not_found" };
  }

  const category = await categoryRepository.findCategoryById(categoryId);

  if (!category) {
    return { book: null, reason: "category_not_found" };
  }

  await bookRepository.addCategoryToBook(bookId, categoryId);

  return {
    book: await bookRepository.findBookById(bookId),
    reason: null,
  };
};

export const removeCategoryFromBook = async (bookId, categoryId) => {
  const book = await bookRepository.findBookById(bookId);

  if (!book) {
    return { removed: false, reason: "book_not_found" };
  }

  const category = await categoryRepository.findCategoryById(categoryId);

  if (!category) {
    return { removed: false, reason: "category_not_found" };
  }

  const removed = await bookRepository.removeCategoryFromBook(
    bookId,
    categoryId,
  );

  if (!removed) {
    return { removed: false, reason: "relationship_not_found" };
  }

  return { removed: true, reason: null };
};
