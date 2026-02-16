const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = auth.split(" ")[1];
    const payload = verifyToken(token);
    req.userId = payload.userId || payload.id;
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return next();
  } catch (_err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
