const Notification = require("../models/notification.model");

async function createNotification({ user, task, message, type }) {
  return Notification.create({
    user,
    task,
    message,
    type,
  });
}

module.exports = createNotification;