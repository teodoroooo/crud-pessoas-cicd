/** Erro base da aplicação, carrega o status HTTP correspondente. */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Pessoa não encontrada') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Já existe uma pessoa cadastrada com este CPF') {
    super(message, 409);
  }
}

module.exports = { AppError, ValidationError, NotFoundError, ConflictError };
