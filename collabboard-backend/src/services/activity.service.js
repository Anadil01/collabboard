const Activity = require("../models/Activity.model");
const socketSvc = require("./socket.service");

exports.log = async ({
  boardId,
  taskId,
  userId,
  action,
  meta
}) => {

  const activity = await Activity.create({
    boardId,
    taskId,
    userId,
    action,
    meta
  });

  socketSvc.emitBoardUpdate(
    boardId.toString(),
    "activityCreated",
    activity
  );

  return activity;
};
