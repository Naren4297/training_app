const express = require('express');
const router = express.Router();
const TrainingTopicController = require('../controllers/TrainingTopicController');

// Get all training topics
router.get('/training-topics', TrainingTopicController.getAllTrainingTopics);

// Create a new training topic
router.post('/training-topics', TrainingTopicController.createTrainingTopic);

// Update a training topic
router.put('/training-topics/:id', TrainingTopicController.updateTrainingTopic);

// Delete a training topic
router.delete('/training-topics/:id', TrainingTopicController.deleteTrainingTopic);

module.exports = router;