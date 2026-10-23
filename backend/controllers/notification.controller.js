const Notification = require("../models/notification.model");

async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("task", "title");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
}

async function markAsRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      message: "Failed to update notification",
    });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
};