// Error is a built-in class used for handling errors.
export class BadRequestError extends Error{
  constructor(message = 'Bad Request') {
      super(message); // Calls the Error class constructor with the given message.
      this.status = 400;
  }
}

export class InternalServerError extends Error{
  constructor(message = 'Internal Server Error') {
      super(message); 
      this.status = 500;
  }
}

export class AuthenticationError extends Error{
  constructor(message = 'Authentication Error') {
      super(message); 
      this.status = 401;
  }
}

// Easier Way to Write the above code;
// You can use a single generic class to handle different types of errors instead of defining separate classes:

// export class CustomError extends Error {
//   constructor(message, status) {
//     super(message);
//     this.status = status;
//   }
// }

// export const BadRequestError = (message = 'Bad Request') => new CustomError(message, 400);
// export const InternalServerError = (message = 'Internal Server Error') => new CustomError(message, 500);

// This simplifies the code while maintaining the same functionality. Now, instead of using throw new BadRequestError(), you can just call:

// throw BadRequestError();
// throw InternalServerError('Something went wrong');