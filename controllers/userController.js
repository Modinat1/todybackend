const userModel = require("../schemas/user.model.js");
const bycrpt = require("bcrypt");

const savePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    const userId = req.user.userId;

    if (!userId || !pushToken) {
      return res.status(400).json({
        message: "pushToken required",
        received: { userId, pushToken },
      });
    }

    await userModel.findByIdAndUpdate(userId, { pushToken }, { new: true });

    res.status(200).json({ message: "Push token saved successfully" });
  } catch (error) {
    console.error("Error saving push token:", error);
    res
      .status(500)
      .json({ message: "Error saving push token", error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    console.log(req.user.userId, "user::::");

    const user = await userModel
      .findById(req.user.userId)
      .select("-password -pushToken");

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    res.status(200).json({
      message: "User found successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }
    if (userName) user.userName = userName;
    if (password) {
      const salt = await bycrpt.genSalt(10);
      user.password = bycrpt.hash(password, salt);
    }

    await user.save();

    const { password: _, ...updatedUser } = user.toObject();

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res
      .status(500)
      .json({ message: "Error updating user profile", error: error.message });
  }
};

module.exports = {
  savePushToken,
  getUserProfile,
  updateUserProfile,
};
