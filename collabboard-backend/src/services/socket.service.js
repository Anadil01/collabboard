const { getIO } = require("../config/socket");

exports.emitBoardUpdate = (boardId, event, payload) => {
  const io = getIO();
  if (!io) return;
  io.to(boardId).emit(event, payload);
};
