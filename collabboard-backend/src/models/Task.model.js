const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({

  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "List",
    required: true,
    index: true
  },

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

  description: String,

  label: {
    type: String,
    enum: ["feature", "design", "bug", "system", "task"],
    default: "task"
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },

  dueDate: {
    type: Date,
    default: null
  },

  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  order: {
    type: Number,
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

taskSchema.index({ title: "text" });
taskSchema.index({ boardId: 1, listId: 1, order: 1 });
taskSchema.index({ boardId: 1, dueDate: 1 });

module.exports = mongoose.model("Task", taskSchema);
