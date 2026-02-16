let io;

exports.initSocket = (server, corsOrigin = "*") => {
  const { Server } = require("socket.io");
  const { verifyToken } = require("../utils/jwt");
  const { joinBoardRoom } = require("../sockets/board.socket");

  io = new Server(server, {
    cors: { origin: corsOrigin }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake?.auth?.token;
      if (!token) {
        return next(new Error("Unauthorized"));
      }
      const payload = verifyToken(token);
      const userId = payload?.userId || payload?.id;
      if (!userId) {
        return next(new Error("Unauthorized"));
      }
      socket.userId = String(userId);
      return next();
    } catch (_err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    joinBoardRoom(socket);
  });

  return io;
};

exports.getIO = () => io;
