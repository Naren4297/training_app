const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.post('/send-notification', notificationController.sendNotification);
router.get('/notifications', notificationController.getNotifications);

module.exports = router;