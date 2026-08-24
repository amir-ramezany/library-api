import * as bookRepository from "../repositories/book.repository.js";
import * as bookService from "../services/book.service.js";

const sendRelationshipError = (response, reason) => {
  if (reason === "book_not_found") {
    return response.status(404).json({ message: "Book not found" });
  }

  if (reason === "category_not_found") {
    return response.status(404).json({ message: "Category not found" });
  }

  return response.status(404).json({ message: "Book category not found" });
};

export const getBooks = async (request, response) => {
  const books = await bookRepository.findBooks();

  response.status(200).json(books);
};

export const getBook = async (request, response) => {
  const book = await bookRepository.findBookById(request.params.id);

  if (!book) {
    return response.status(404).json({ message: "Book not found" });
  }

  response.status(200).json(book);
};

export const createBook = async (request, response) => {
  const book = await bookService.createBook(request.body);

  if (!book) {
    return response.status(404).json({ message: "Author not found" });
  }

  response.status(201).json(book);
};

export const updateBook = async (request, response) => {
  const result = await bookService.updateBook(request.params.id, request.body);

  if (result.reason === "book_not_found") {
    return response.status(404).json({ message: "Book not found" });
  }

  if (result.reason === "author_not_found") {
    return response.status(404).json({ message: "Author not found" });
  }

  response.status(200).json(result.book);
};

export const deleteBook = async (request, response) => {
  const wasDeleted = await bookRepository.deleteBook(request.params.id);

  if (!wasDeleted) {
    return response.status(404).json({ message: "Book not found" });
  }

  response.status(204).send();
};

export const addBookCategory = async (request, response) => {
  const result = await bookService.addCategoryToBook(
    request.params.bookId,
    request.params.categoryId,
  );

  if (result.reason) {
    return sendRelationshipError(response, result.reason);
  }

  response.status(200).json(result.book);
};

export const removeBookCategory = async (request, response) => {
  const result = await bookService.removeCategoryFromBook(
    request.params.bookId,
    request.params.categoryId,
  );

  if (result.reason) {
    return sendRelationshipError(response, result.reason);
  }

  response.status(204).send();
};
