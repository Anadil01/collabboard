const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({

  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    index: true
  },

  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  action: {
    type: String,
    required: true
  },

  meta: {
    type: Object
  }

}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
