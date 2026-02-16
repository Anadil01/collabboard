module.exports = (validator) => (req, res, next) => {
  const message = validator(req);
  if (message) {
    return res.status(400).json({ message });
  }
  next();
};
