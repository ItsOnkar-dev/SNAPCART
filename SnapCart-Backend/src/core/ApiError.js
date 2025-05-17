// Error is a built-in class used for handling errors.
export class CustomError extends Error {
  constructor (message, status) {
    super(message)
    this.status = status
  }
}

export const BadRequestError = (message = 'Bad Request') => new CustomError(message, 400)
export const InternalServerError = (message = 'Internal Server Error') => new CustomError(message, 500)
export const NotFoundError = (message = 'Not Found') => new CustomError(message, 404)
export const AuthenticationError = (message = 'Authentication Error') => new CustomError(message, 401)
export const AuthorizationError = (message = 'Authorization Error') => new CustomError(message, 403)
