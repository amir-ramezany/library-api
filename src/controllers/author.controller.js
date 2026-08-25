import * as authorRepository from "../repositories/author.repository.js";
import AppError from "../utils/app-error.js";

export const getAuthors = async (request, response) => {
  const authors = await authorRepository.findAuthors();

  response.status(200).json(authors);
};

export const getAuthor = async (request, response) => {
  const author = await authorRepository.findAuthorById(request.params.id);

  if (!author) {
    throw new AppError(404, "Author not found");
  }

  response.status(200).json(author);
};

export const createAuthor = async (request, response) => {
  const author = await authorRepository.createAuthor(request.body);

  response.status(201).json(author);
};

export const updateAuthor = async (request, response) => {
  const author = await authorRepository.updateAuthor(
    request.params.id,
    request.body,
  );

  if (!author) {
    throw new AppError(404, "Author not found");
  }

  response.status(200).json(author);
};

export const deleteAuthor = async (request, response) => {
  const wasDeleted = await authorRepository.deleteAuthor(request.params.id);

  if (!wasDeleted) {
    throw new AppError(404, "Author not found");
  }

  response.status(204).send();
};
