const express = require('express');
const router = express.Router();
const cors = require("cors");
const feedbackController = require('../trainee/trainee.controller'); 
router.use(cors());

//Route to get Dashboard data
router.get('/dashboard', feedbackController.traineeDashboard);

// Route to handle feedback form submission
router.post('/submit-feedback', feedbackController.submitFeedback);
router.post('/submit-assessmentReport', feedbackController.submitAssessmentReport);
router.get('/get-assessmentReportTrainee',feedbackController.getAssessmentReport);

router.get('/get-consolidated-report',feedbackController.getConsolidatedReport);

// Route to get assessment details
router.get('/assessments', feedbackController.getAssessmentDetails);

// Route to start assessment
router.post('/start-assessment', feedbackController.startAssessment);

router.post('/submit-assessment', feedbackController.submitAssessment);

// Route to get a specific assessment by ID
router.get('/assessment-details', feedbackController.getAssessmentById);
// Get assessments under a training program ID
router.get('/assessment-details-by-trainingprogramID', feedbackController.getAssessmentByTrainingProgramID);
module.exports = router;
