const db = require('../../../config/db.config');
const TrainingTopic = require('../models/TrainingTopic')(db.sequelize);
const Subtopic = require('../models/Subtopic')(db.sequelize);

exports.getAllTrainingTopics = async (req, res) => {
    try {
      const trainingTopics = await TrainingTopic.findAll({
        include: [{
          model: Subtopic,
          as: 'subtopics'
        }]
      });
      res.status(200).json(trainingTopics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

exports.createTrainingTopic = async (req, res) => {
  try {
    const trainingTopic = await TrainingTopic.create(req.body, { user: req.user });
    res.status(201).json(trainingTopic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTrainingTopic = async (req, res) => {
  try {
    const trainingTopic = await TrainingTopic.findByPk(req.params.id);
    if (!trainingTopic) {
      return res.status(404).json({ error: 'Training topic not found' });
    }
    await trainingTopic.update(req.body, { user: req.user });
    res.status(200).json(trainingTopic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTrainingTopic = async (req, res) => {
  try {
    const trainingTopic = await TrainingTopic.findByPk(req.params.id);
    if (!trainingTopic) {
      return res.status(404).json({ error: 'Training topic not found' });
    }
    await trainingTopic.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};