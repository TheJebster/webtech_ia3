// An id that can never match a document should produce a 404, not an unhandled
// Mongoose CastError that surfaces as a 500 "Server error".
const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

const isValidObjectId = (id) => OBJECT_ID_PATTERN.test(String(id));

// Route guard for paths that carry an :id param.
const validObjectId = (label = 'Resource') => (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: `${label} not found` });
  }
  next();
};

module.exports = { validObjectId, isValidObjectId };
