require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const { env } = require("./config/env");
const { logger } = require("./utils/logger");

const server = http.createServer(app);
initSocket(server, env.CLIENT_URL);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to start server", err);
    process.exit(1);
  });
