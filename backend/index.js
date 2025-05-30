const express = require('express');
const coordinatorRoutes = require('./src/modules/coordinator/routes/coordinator.route');
const feedbackRoutes = require("./src/modules/trainee/trainee.route"); 
const trainerRoutes = require("./src/modules/trainer/trainer.route"); 
const adminRoutes = require("./src/modules/admin/admin.route");
const loginRoutes = require("./src/modules/login/login.route")
const notificationToutes = require("./src/modules/notifications/routes/notification.routes") 
const authenticateToken = require("./src/modules/admin/admin.middleware")



const router = express.Router();
router.use('/coordinator',authenticateToken ,coordinatorRoutes);
router.use('/trainees',authenticateToken ,feedbackRoutes);
router.use('/trainers',authenticateToken,trainerRoutes);
router.use('/admin',authenticateToken, adminRoutes);
router.use('/notification',authenticateToken, notificationToutes);
router.use('/login',loginRoutes)


module.exports = router;
