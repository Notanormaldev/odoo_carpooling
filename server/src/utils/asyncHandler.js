/**
 * Wraps async route handlers to catch errors and forward to express error handler.
 * Eliminates try-catch boilerplate in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
