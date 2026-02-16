const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  }],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  memberRoles: {
    type: Map,
    of: {
      type: String,
      enum: ["owner", "admin", "member"]
    },
    default: {}
  }

}, { timestamps: true });

boardSchema.index({ title: "text" });

module.exports = mongoose.model("Board", boardSchema);
