const db = require('../../config/db.config.js');
const TrainingTracker = db.trainingTrackers;

// Create and Save a new TrainingTracker
exports.create = async (req, res) => {
  try {
    const trainingTracker = await TrainingTracker.create(req.body, { user: req.user.name });
    res.status(201).send(trainingTracker);
  } catch (error) {
    res.status(500).send({ message: 'qwerr' });
  }
};

// Retrieve all TrainingTrackers
exports.findAll = async (req, res) => {
  try {
    const trainingTrackers = await TrainingTracker.findAll();
    res.status(201).send(trainingTrackers);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update a TrainingTracker by the id in the request
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await TrainingTracker.update(req.body, { where: { id: id }, user: req.user.name });
    if (updated) {
      const updatedTrainingTracker = await TrainingTracker.findOne({ where: { id: id } });
      res.status(200).send(updatedTrainingTracker);
    } else {
      res.status(404).send({ message: 'TrainingTracker not found' });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete a TrainingTracker with the specified id in the request
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await TrainingTracker.destroy({ where: { id: id } });
    if (deleted) {
      res.status(200).send({ message: 'TrainingTracker deleted' });
    } else {
      res.status(404).send({ message: 'TrainingTracker not found' });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};