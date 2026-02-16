const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true
  },

  order: {
    type: Number,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("List", listSchema);
