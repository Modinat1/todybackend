const cron = require("node-cron");
const todoModel = require("../schemas/todo.model.js");
const sendPushNotification = require("../utils/sendNotification.js");

function notifyTodo() {
  cron.schedule("*/1 * * * *", async () => {
    const now = new Date();

    // We want dueAt to be ~1 minute from now
    const oneMinFromNow = new Date(now.getTime() + 60 * 1000);

    const thirtySecBefore = new Date(oneMinFromNow.getTime() - 30 * 1000);
    const thirtySecAfter = new Date(oneMinFromNow.getTime() + 30 * 1000);

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

      console.log(
        `[${now.toISOString()}] Checking reminders for todos due around ${oneMinFromNow.toISOString()}`
      );

      for (const todo of upcomingTodos) {
        const user = todo.userId;
        if (!user?.pushToken) continue;

        await sendPushNotification({
          to: user.pushToken,
          title: "⏰ Todo Reminder",
          body: `Your todo "${todo.todoTitle}" is due in 1 minute!`,
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
