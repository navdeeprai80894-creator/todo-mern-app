// validate(schema, 'body' | 'query') -> puts the parsed, typed result on req.validated
export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    req.validated = schema.parse(req[source]);
    next();
  } catch (err) {
    next(err); // ZodError is formatted by the error handler
  }
};
