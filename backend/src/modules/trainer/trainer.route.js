const express = require('express');
const cors = require("cors");
const  trainerController = require('../trainer/trainer.controller');

const router = express.Router();
router.use(cors());

// Define the route
router.post('/submit-questionAnswers', trainerController.saveQuestionsAnswers);
router.post('/submit-evaluation', trainerController.submitEvaluation);
router.get('/get-dataset-names', trainerController.getAllDatasetNames);
router.put('/update-dataset/:id', trainerController.updateDataset);
router.delete('/delete-dataset/:datasetName', trainerController.deleteDataset);
router.get('/fetchqaDataset/:datasetName',trainerController.fetchqaDataset)

router.get('/assessment-submissions',trainerController.fetchAssessmentSubmissions);
router.get('/assessment-submission',trainerController.fetchAssessmentSubmissionById);

router.get('/get-questionAnswers', trainerController.fetchQuestionsAnswers);

module.exports = router;
