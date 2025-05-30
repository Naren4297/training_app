const Notification = require('../models/notification.model');

exports.sendNotification = async (req, res) => {
  const { userId,message } = req.body;
  try {
    // const empID = req.user.empID;
    const notification = await Notification.create({userId, message });
    req.io.to(userId).emit('notification', notification); // Emit to the room with empID
    res.status(200).send(notification);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const empID = req.user.empID;
    const notifications = await Notification.findAll({ where: { empID } }); // Fetch notifications for specific user
    res.status(200).send(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};