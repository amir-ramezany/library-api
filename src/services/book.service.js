import * as authorRepository from "../repositories/author.repository.js";
import * as bookRepository from "../repositories/book.repository.js";

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
