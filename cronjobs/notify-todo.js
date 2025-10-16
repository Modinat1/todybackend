const cron = require("node-cron");
const todoModel = require("../schemas/todo.model.js");
const sendPushNotification = require("../utils/sendNotification.js");

function notifyTodo() {
  // ⏰ Run every 10 minutes
  cron.schedule("*/1 * * * *", async () => {
    // cron.schedule("*/10 * * * *", async () => {
    const now = new Date();
    const fiveMinFromNow = new Date(now.getTime() + 10 * 60 * 1000); // 5 min ahead
    // const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead

    try {
      // Find todos due within the next hour and not yet notified
      const upcomingTodos = await todoModel
        .find({
          status: "pending",
          dueAt: { $lte: fiveMinFromNow, $gt: now },
          notifiedBeforeDue: false,
        })
        .populate("userId", "userName pushToken");

      for (const todo of upcomingTodos) {
        const user = todo.userId;
        if (!user?.pushToken) continue;

        // Send push notification
        await sendPushNotification({
          to: user.pushToken,
          title: "⏰ Todo Reminder",
          body: `Your todo "${todo.title}" is almost due!`,
          data: { todoId: todo._id },
        });

        // Mark as notified
        await todoModel.updateOne(
          { _id: todo._id },
          { $set: { notifiedBeforeDue: true } }
        );
      }

      console.log(
        `${upcomingTodos.length} reminder(s) sent at ${now.toISOString()}`
      );
    } catch (error) {
      console.error("Error running reminder job:", error);
    }
  });

  // console.log("✅ Cron job for todo reminders started");
}

module.exports = notifyTodo;
