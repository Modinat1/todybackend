const userModel = require("../schemas/user.model.js");

const updatePushToken = async (req, res) => {
  try {
    const { token } = req.body;
    await userModel.findByIdAndUpdate(req.user.userId, { pushToken: token });
    res.status(200).json({ message: "Push token updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving push token", error: error.message });
  }
};

module.exports = {
  updatePushToken,
};
