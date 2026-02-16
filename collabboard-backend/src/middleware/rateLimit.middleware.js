const buckets = new Map();

module.exports = ({ windowMs = 60_000, max = 120 } = {}) => {
  return (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const row = buckets.get(key) || { count: 0, start: now };

    if (now - row.start > windowMs) {
      row.count = 0;
      row.start = now;
    }

    row.count += 1;
    buckets.set(key, row);

    if (row.count > max) {
      return res.status(429).json({ message: "Too many requests" });
    }

    next();
  };
};
