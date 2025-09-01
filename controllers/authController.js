const userModel = require("../schemas/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { userName, password, email } = req.body;

    const emailExists = await userModel.findOne({ email });

    if (emailExists) {
      res.status(409).json({ message: "Email already exist" });
      return;
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    const newUser = await userModel.create({
      userName,
      password: hashPassword,
      email,
    });

    res.status(201).send({
      message: "User created successfully!",
      user: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resgistering", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    console.log("user:::", user);

    if (!user) {
      res.status(404).send({
        message: "User not found",
      });
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      res.status(400).send({
        message: "Wrong credentials",
      });
      return;
    }
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userName: user.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({
      message: "login successful",
      user: {
        userId: user._id,
        email: user.email,
        userName: user.userName,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

module.exports = {
  register,
  login,
};
