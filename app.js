const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRouter = require("./routers/authRouter");
const todoRouter = require("./routers/todoRouter");
const commentRouter = require("./routers/commentRouter");
const notifyTodo = require("./cronjobs/notify-todo.js");
const userRouter = require("./routers/userRouter.js");

require("dotenv").config();

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log(`connected to database`);
  } catch (error) {
    console.log("Error connecting to the database" + error);
  }
};
const app = express();

if (process.env.NODE_ENV !== "test" && !global.__todoCronStarted) {
  global.__todoCronStarted = true;
  notifyTodo();
}

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/auth", authRouter);
app.use("/todo", todoRouter);
app.use("/comment", commentRouter);
app.use("/user", userRouter);

// app.listen(process.env.PORT, () => {
//   console.log(`Server has started on port ${process.env.PORT}`);
//   connectToDatabase();
// });

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Server has started on port ${process.env.PORT}`);
  connectToDatabase();
});
