const cron = require("node-cron");

const todoModel = require("../schemas/todo.model.js");
import { sendPushNotification } from "../utils/notifications.js"; // utility you'll create

// Run every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead

  // Find todos that are due within the next hour, not completed or notified yet
  const upcomingTodos = await todoModel
    .find({
      status: "pending",
      dueDate: { $lte: oneHourFromNow, $gt: now },
      notifiedBeforeDue: false,
    })
    .populate("userId", "userName pushToken"); // user push token (from Expo or FCM)

  for (const todo of upcomingTodos) {
    const user = todo.userId;
    if (!user?.pushToken) continue;

    await sendPushNotification({
      to: user.pushToken,
      title: "⏰ Todo Reminder",
      body: `Your todo "${todo.title}" is almost due!`,
      data: { todoId: todo._id },
    });

    await todoModel.updateOne({ _id: todo._id }, { notifiedBeforeDue: true });
  }

  console.log(
    `${upcomingTodos.length} reminder(s) sent at ${now.toISOString()}`
  );
});
