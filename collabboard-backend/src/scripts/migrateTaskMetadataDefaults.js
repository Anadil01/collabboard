require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Task = require("../models/Task.model");

const VALID_LABELS = ["feature", "design", "bug", "system", "task"];
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"];

async function run() {
  const dryRun = process.argv.includes("--dry-run");
  await connectDB();

  const labelQuery = {
    $or: [
      { label: { $exists: false } },
      { label: null },
      { label: "" },
      { label: { $nin: VALID_LABELS } }
    ]
  };

  const priorityQuery = {
    $or: [
      { priority: { $exists: false } },
      { priority: null },
      { priority: "" },
      { priority: { $nin: VALID_PRIORITIES } }
    ]
  };

  const dueDateQuery = {
    dueDate: { $exists: false }
  };

  const [labelCount, priorityCount, dueDateCount] = await Promise.all([
    Task.countDocuments(labelQuery),
    Task.countDocuments(priorityQuery),
    Task.countDocuments(dueDateQuery)
  ]);

  console.log("Task metadata migration plan:");
  console.log(`- label -> "task": ${labelCount} document(s)`);
  console.log(`- priority -> "medium": ${priorityCount} document(s)`);
  console.log(`- dueDate -> null: ${dueDateCount} document(s)`);

  if (dryRun) {
    console.log("Dry run only. No documents were updated.");
    return;
  }

  const [labelResult, priorityResult, dueDateResult] = await Promise.all([
    Task.updateMany(labelQuery, { $set: { label: "task" } }),
    Task.updateMany(priorityQuery, { $set: { priority: "medium" } }),
    Task.updateMany(dueDateQuery, { $set: { dueDate: null } })
  ]);

  console.log("Task metadata migration complete:");
  console.log(`- label updated: ${labelResult.modifiedCount}`);
  console.log(`- priority updated: ${priorityResult.modifiedCount}`);
  console.log(`- dueDate updated: ${dueDateResult.modifiedCount}`);
}

run()
  .catch((error) => {
    console.error("Task metadata migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (_err) {
      // no-op
    }
  });
