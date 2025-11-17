const cron = require("node-cron");
const todoModel = require("../schemas/todo.model.js");
const sendPushNotification = require("../utils/sendNotification.js");

function notifyTodo() {
  cron.schedule("*/1 * * * *", async () => {
    const now = new Date();
    const thirtySecBefore = new Date(now.getTime() - 30 * 1000);
    const thirtySecAfter = new Date(now.getTime() + 30 * 1000);

    try {
      const upcomingTodos = await todoModel
        .find({
          status: "pending",
          notifiedBeforeDue: false,
          dueAt: {
            $gte: thirtySecBefore,
            $lte: thirtySecAfter,
          },
        })
        .populate("userId", "userName pushToken");

      console.log(`[${new Date().toISOString()}] Checking for reminders...`);
      console.log(`Found ${upcomingTodos.length} upcoming todo(s)`);

      for (const todo of upcomingTodos) {
        const user = todo.userId;

        if (!user?.pushToken) continue;

        await sendPushNotification({
          to: user.pushToken,
          title: "⏰ Todo Reminder",
          body: `Your todo "${todo.todoTitle}" is due soon!`,
          data: { todoId: todo._id.toString() },
        });

        await todoModel.updateOne(
          { _id: todo._id },
          { $set: { notifiedBeforeDue: true } }
        );
      }
    } catch (err) {
      console.error("Reminder job error:", err);
    }
  });

  // console.log(" Cron job for todo reminders started");
}

module.exports = notifyTodo;
