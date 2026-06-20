// This file holds two pieces of middleware that run at the very end of the
// request pipeline. Express runs middleware top-to-bottom in the order you
// register it with app.use() — these two are registered last in server.js,
// on purpose, so they only fire once nothing else has handled the request.

// 1) notFound — catches any request that didn't match a single route above it.
// We don't send a 404 response directly here. Instead we build an Error and
// hand it to next(error). That's the signal in Express that says
// "stop running normal middleware, jump straight to the error handler."
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// 2) errorHandler — the single place ALL errors end up, whether they came
// from notFound above, from `next(error)` inside a controller, or (in
// Express 5) from an error thrown inside an async route handler.
// Express recognizes this as an error handler specifically because it
// takes FOUR arguments (err, req, res, next) instead of three.
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(err.stack);

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    // Stack traces are useful while developing and a security leak in production.
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};