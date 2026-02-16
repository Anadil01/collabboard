module.exports = (err, req, res, next) => {
  if (err?.name === "CastError") {
    return res.status(400).json({ message: "Invalid id format" });
  }

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ message });
};
