const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../admin/models/admin.model');
const { Coordinator } = require('../admin/models/coordinator.model');
const { Trainer } = require('../admin/models/trainer.model');
const { Trainee } = require('../admin/models/trainee.model');

const models = [
  { name: 'Admin', model: Admin },
  { name: 'Coordinator', model: Coordinator },
  { name: 'Trainer', model: Trainer },
  { name: 'Trainee', model: Trainee }
];

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;
    let modelName = '';
    const lowerCaseEmail = email.toLowerCase();

    for (const { name, model } of models) {
      user = await model.findOne({ where: { email: lowerCaseEmail } });
      if (user) {
        modelName = name.toLowerCase();
        break;
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Generate JWT token
    // const token = jwt.sign({ id: user.id, modelName,username:user.name,empID:user.employeeID }, process.env.SECRET_KEY, { expiresIn: '10h' });
    // res.cookie('empID', user.empID, { httpOnly: true, secure: true });
    // res.status(200).json({ success: true, message: 'Login successful', token });
    const token = jwt.sign({ id: user.id, modelName,username:user.name }, process.env.SECRET_KEY, { expiresIn: '10h' });
    res.status(200).json({ success: true, message: 'Login successful', token, data:{
      modelName,
      user:user
    } });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};