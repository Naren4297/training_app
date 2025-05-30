const express = require('express');
const router = express.Router();
const cors = require("cors");
const multer = require('multer');
const { createTrainingProgram, getTrainingProgramByID, getAllTrainingPrograms, updateTrainingProgramByID, deleteTrainingProgramByID,getTopicsByTrainingProgram,getTrainingProgramsForCardData, updateSubtopicStatus, getTrainingPrograms, getAllTrainingProgramsAssessment } = require('../controllers/coordinator.controller');
const { createTrainingAssignment, getTrainingAssignments, getTrainingAssignmentByID, updateTrainingAssignment, deleteTrainingAssignment, getTrainingAssignmentDetails, getFormattedTrainingAssignmentDetails } = require('../controllers/trainingassignment.controller');
const {getTrainers, getTrainees, getBatches} = require('../../admin/controllers/admin.controller');
const { createAssessment, getAssessmentById, updateAssessmentAndQA,getAssessmentDetails,deleteAssessment,getAssessmentsByAssignment, fetchAssessmentSubmissions } = require('../controllers/assessmentQa.controller');
const { uploadFile,getFilesByProgramId,deleteFileByProgramIdAndFileName } = require('../controllers/uploadFile.controller');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.use(cors());

// --------------- Training Programs --------------------------------------------------------
router.post('/training-program', createTrainingProgram);
router.get('/training-program/:id', getTrainingProgramByID);
router.get('/training-programs', getAllTrainingPrograms);
router.get('/training-programs-title', getTrainingPrograms);
router.get('/training-programs-status', getTrainingProgramsForCardData); //For DashBoard
router.put('/training-program/:id', updateTrainingProgramByID); // Updated
router.delete('/training-program/:id', deleteTrainingProgramByID); // Updated
// 
router.get('/training-programs-assessment', getAllTrainingProgramsAssessment);
// --------------------------------------------------------------------------------------------

// ----------- Training Assignment -----------------------------------------------
router.post('/createtrainingassignment', createTrainingAssignment);
router.get('/training-assignments', getTrainingAssignments);
router.get('/training-assignment/:id', getTrainingAssignmentByID);
router.put('/training-assignment/:id', updateTrainingAssignment);
router.delete('/training-assignment/:id', deleteTrainingAssignment);
router.get('/training-assignment/details/:id', getTrainingAssignmentDetails );
router.get('/getFormattedTrainingAssignmentDetails/:id', getFormattedTrainingAssignmentDetails);
// --------------------------------------------------------------------------------

router.put('/training-program/subtopics/status', updateSubtopicStatus);

router.get('/trainers', getTrainers);

// Trainee APIs
router.get('/trainees', getTrainees);

// Batch APIs
router.get('/batches', getBatches);

router.get('/', (req, res) => {
    res.send('Coordinator route is working!');
});

//topic changes
router.get('/topics/:trainingprogram_id', getTopicsByTrainingProgram)


router.post('/upload', upload.array('files'), uploadFile);
router.get('/files/:programId', getFilesByProgramId);
router.delete('/files/:programId/:fileName', deleteFileByProgramIdAndFileName);

// Co-ordinator changes
router.post('/submit-assessment', createAssessment);
router.get('/assessment/:id', getAssessmentById);
router.put('/edit-assessment/:id', updateAssessmentAndQA);
router.get('/get-assessments', getAssessmentDetails);
router.delete('/delete-assessment/:id', deleteAssessment);
router.get('/get-assessment-report', getAssessmentsByAssignment);
router.get('/get-submitted-assessment', fetchAssessmentSubmissions);

module.exports = router;
