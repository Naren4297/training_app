const { Admin } = require('../admin/models/admin.model');
const { Coordinator } = require('../admin/models/coordinator.model');
const { Trainer } = require('../admin/models/trainer.model');

// Helper function to check for duplicate employeeID
const checkDuplicateEmployeeID = async (Model, employeeID) => {
  const existingEntity = await Model.findOne({ where: { employeeID } });
  return existingEntity !== null;
};

// Create a new admin
exports.createAdmin = async (req, res) => {
  try {
    const { username } = req.user;
    const { employeeID } = req.body;
    const isDuplicate = await checkDuplicateEmployeeID(Admin, employeeID);
    if (isDuplicate) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }
    const bodyData = { ...req.body, createdBy: username, modifiedBy: username };
    const admin = await Admin.create(bodyData);
    res.status(200).json(admin);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// Get all admins
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get an admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an admin
exports.updateAdmin = async (req, res) => {
  try {
    const { username } = req.user;
    const [updated] = await Admin.update({ ...req.body, modifiedBy: username }, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    const updatedAdmin = await Admin.findByPk(req.params.id);
    res.status(200).json(updatedAdmin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an admin
exports.deleteAdmin = async (req, res) => {
  try {
    const deleted = await Admin.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.status(200).json({ message: 'Admin deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new coordinator
exports.createCoordinator = async (req, res) => {
  try {
    const { username } = req.user;
    const { employeeID } = req.body;
    const isDuplicate = await checkDuplicateEmployeeID(Coordinator, employeeID);
    if (isDuplicate) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }
    const bodyData = { ...req.body, createdBy: username, modifiedBy: username };
    const coordinator = await Coordinator.create(bodyData);
    res.status(201).json(coordinator);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all coordinators
exports.getCoordinators = async (req, res) => {
  try {
    const coordinators = await Coordinator.findAll();
    res.status(200).json(coordinators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a coordinator by ID
exports.getCoordinatorById = async (req, res) => {
  try {
    const coordinator = await Coordinator.findByPk(req.params.id);
    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }
    res.status(200).json(coordinator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a coordinator
exports.updateCoordinator = async (req, res) => {
  try {
    const { username } = req.user;
    const [updated] = await Coordinator.update({ ...req.body, modifiedBy: username }, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }
    const updatedCoordinator = await Coordinator.findByPk(req.params.id);
    res.status(200).json(updatedCoordinator);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a coordinator
exports.deleteCoordinator = async (req, res) => {
  try {
    const deleted = await Coordinator.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }
    res.status(200).json({ message: 'Coordinator deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new trainer
exports.createTrainer = async (req, res) => {
  try {
    const { username } = req.user;
    const { employeeID } = req.body;
    const isDuplicate = await checkDuplicateEmployeeID(Trainer, employeeID);
    if (isDuplicate) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }
    const bodyData = { ...req.body, createdBy: username, modifiedBy: username };
    const trainer = await Trainer.create(bodyData);
    res.status(201).json(trainer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all trainers
exports.getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.findAll();
    res.status(200).json(trainers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Get a trainer by ID
exports.getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }
    res.status(200).json(trainer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a trainer
exports.updateTrainer = async (req, res) => {
  try {
    const { username } = req.user;
    const [updated] = await Trainer.update({ ...req.body, modifiedBy: username }, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ error: 'Trainer not found' });
    }
    const updatedTrainer = await Trainer.findByPk(req.params.id);
    res.status(200).json(updatedTrainer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a trainer
exports.deleteTrainer = async (req, res) => {
  try {
    const deleted = await Trainer.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Trainer not found' });
    }
    res.status(200).json({ message: 'Trainer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};