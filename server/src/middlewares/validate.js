import ApiError from '../utils/ApiError.js';

/**
 * Zod schema validation middleware factory.
 * Usage: router.post('/route', validate(schema), controller)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.slice(1).join('.'),
      message: e.message,
    }));
    throw ApiError.badRequest('Validation failed', errors);
  }

  // Attach parsed (sanitized) data back to req
  req.body = result.data.body || req.body;
  req.query = result.data.query || req.query;
  req.params = result.data.params || req.params;

  next();
};

export default validate;
