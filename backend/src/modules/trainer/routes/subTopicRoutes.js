const express = require('express');
const router = express.Router();
const SubtopicController = require('../controllers/SubtopicController');

// Create a new subtopic
router.post('/subtopics', SubtopicController.createSubtopic);

// Update an existing subtopic
router.put('/subtopics/:id', SubtopicController.updateSubtopic);

// Delete a subtopic
router.delete('/subtopics/:id', SubtopicController.deleteSubtopic);

module.exports = router;