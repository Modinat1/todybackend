const cron = require("node-cron");
const todoModel = require("../schemas/todo.model.js");
const sendPushNotification = require("../utils/sendNotification.js");

function notifyTodo() {
  // ⏰ Run every minute (change to */10 for every 10 minutes in production)
  cron.schedule("*/1 * * * *", async () => {
    const now = new Date();
    const fiveMinFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    try {
      // Find todos due within the next 5 minutes and not yet notified
      const upcomingTodos = await todoModel
        .find({
          status: "pending",
          dueAt: {
            $lte: fiveMinFromNow,
            $gt: now,
          },
          notifiedBeforeDue: false,
        })
        .populate("userId", "userName pushToken");

      console.log(`[${new Date().toISOString()}] Checking for reminders...`);
      console.log(`Found ${upcomingTodos.length} upcoming todo(s)`);

      for (const todo of upcomingTodos) {
        const user = todo.userId;

        if (!user?.pushToken) {
          console.log(`Skipping todo ${todo._id}: No push token`);
          continue;
        }

        console.log(`Sending notification for: "${todo.todoTitle}"`);

        // Send push notification
        await sendPushNotification({
          to: user.pushToken,
          title: "⏰ Todo Reminder",
          body: `Your todo "${todo.todoTitle}" is due soon!`,
          data: { todoId: todo._id.toString() },
        });

        // Mark as notified
        await todoModel.updateOne(
          { _id: todo._id },
          { $set: { notifiedBeforeDue: true } }
        );

        console.log(`✅ Notification sent successfully`);
      }
    } catch (error) {
      console.error("❌ Error running reminder job:", error);
    }
  });

  console.log("✅ Cron job for todo reminders started");
}

module.exports = notifyTodo;
