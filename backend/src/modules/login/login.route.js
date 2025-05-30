const express = require('express');
const router = express.Router();
const cors = require("cors");
const loginController = require('../login/login.controller'); 
router.use(cors());
// Route to handle feedback form submission
router.post('/loginUser', loginController.loginUser);

module.exports = router;
