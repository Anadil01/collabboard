const mongoose = require("mongoose");
const Board = require("../models/Board.model");

exports.joinBoardRoom = (socket) => {
  socket.on("joinBoard", async (boardId) => {
    try {
      const userId = socket.userId;
      if (!userId) return;
      if (!mongoose.isValidObjectId(boardId)) return;

      const board = await Board.findOne({
        _id: boardId,
        members: userId
      }).select("_id");

      if (!board) return;
      socket.join(String(boardId));
    } catch (_err) {
      // Ignore malformed join attempts and transient db failures.
    }
  });
};
