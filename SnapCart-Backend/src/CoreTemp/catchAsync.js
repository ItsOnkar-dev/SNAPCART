// Higher-order function that helps in handling asynchronous errors in Express.js without using try-catch in every route handler.

// When working with async functions in Express.js, if an error occurs inside an async route handler and we don’t handle it properly, Express won’t catch it automatically.

// With catchAsync, we can wrap our async route handlers so that errors are automatically forwarded to Express's next().

function catchAsync(callback) {  
  return (req, res, next) => {  
      callback(req, res, next)  
          .catch((err) => {  
              next(err); 
      }) 
  }
}

export default catchAsync;

// 1. catchAsync function accepts an async callback function (callback) as an argument.
// 2. Returns a new function that Express can use as a route handler.
// 3. Executes callback(req, res, next), which returns a promise (since it's an async function).
// 4. If the promise rejects (error occurs), the .catch(err) block automatically forwards the error to Express’s next(err), so the error middleware can handle it.