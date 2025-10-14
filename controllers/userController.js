const userModel = require("../schemas/user.model.js");

const savePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({ message: "pushToken required" });
    }

    await userModel.findByIdAndUpdate(
      req.user.userId,
      { pushToken },
      { new: true }
    );
    res.status(200).json({ message: "Push token saved successfully" });
  } catch (error) {
    console.error("Error saving push token:", error);
    res
      .status(500)
      .json({ message: "Error saving push token", error: error.message });
  }
};

module.exports = {
  savePushToken,
};
