const cron = require("node-cron");
const todoModel = require("../schemas/todo.model");

const markOverdueTodos = () => {
  console.log("⚙️ Mark Overdue Todos job initialized...");

  // Run every hour (you can adjust this)
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Running mark-overdue job...");

    try {
      const now = new Date();

      const result = await todoModel.updateMany(
        {
          dueDate: { $lt: now },
          status: { $nin: ["completed", "overdue"] },
        },
        { $set: { status: "overdue" } }
      );

      if (result.modifiedCount > 0) {
        console.log(`Marked ${result.modifiedCount} todos as overdue`);
      } else {
        console.log("No overdue todos found this run");
      }
    } catch (error) {
      console.error("Error marking overdue todos:", error);
    }
  });
};

module.exports = markOverdueTodos;
