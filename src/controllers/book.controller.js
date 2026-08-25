import * as bookRepository from "../repositories/book.repository.js";
import * as bookService from "../services/book.service.js";
import AppError from "../utils/app-error.js";

export const getBooks = async (request, response) => {
  const { page, limit } = request.validatedQuery;
  const result = await bookRepository.findBooks(request.validatedQuery);

  response.status(200).json({
    data: result.books,
    pagination: {
      page,
      limit,
      totalItems: result.totalItems,
      totalPages: Math.ceil(result.totalItems / limit),
    },
  });
};

export const getBook = async (request, response) => {
  const book = await bookRepository.findBookById(request.params.id);

  if (!book) {
    throw new AppError(404, "Book not found");
  }

  response.status(200).json(book);
};

export const createBook = async (request, response) => {
  const book = await bookService.createBook(request.body);

  response.status(201).json(book);
};

export const updateBook = async (request, response) => {
  const book = await bookService.updateBook(request.params.id, request.body);

  response.status(200).json(book);
};

export const deleteBook = async (request, response) => {
  const wasDeleted = await bookRepository.deleteBook(request.params.id);

  if (!wasDeleted) {
    throw new AppError(404, "Book not found");
  }

  response.status(204).send();
};

export const addBookCategory = async (request, response) => {
  const book = await bookService.addCategoryToBook(
    request.params.bookId,
    request.params.categoryId,
  );

  response.status(200).json(book);
};

export const removeBookCategory = async (request, response) => {
  await bookService.removeCategoryFromBook(
    request.params.bookId,
    request.params.categoryId,
  );

  response.status(204).send();
};
