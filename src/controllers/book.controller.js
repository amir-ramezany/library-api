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

const getQueryString = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue || undefined;
};

const getPositiveInteger = (value, fallback) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
};

export const getBooks = async (request, response) => {
  const page = getPositiveInteger(request.query.page, 1);
  const limit = Math.min(getPositiveInteger(request.query.limit, 10), 100);

  const result = await bookRepository.findBooks({
    search: getQueryString(request.query.search),
    authorId: getQueryString(request.query.authorId),
    category: getQueryString(request.query.category),
    publishedYear: getQueryString(request.query.publishedYear),
    sortBy: getQueryString(request.query.sortBy),
    order: getQueryString(request.query.order)?.toLowerCase(),
    page,
    limit,
  });

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
