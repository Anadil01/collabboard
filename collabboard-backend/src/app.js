const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("./middleware/rateLimit.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const boardRoutes = require("./routes/board.routes");
const listRoutes = require("./routes/list.routes");
const taskRoutes = require("./routes/task.routes");
const activityRoutes = require("./routes/activity.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(rateLimit());

app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);
app.use("/lists", listRoutes);
app.use("/tasks", taskRoutes);
app.use("/activities", activityRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorMiddleware);

module.exports = app;
