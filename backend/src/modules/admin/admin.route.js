const express = require('express');
const router = express.Router();
const cors = require("cors");
const batchController = require('./batches.controller');
const groupController = require('./groups.controller');

router.use(cors());

// Route to handle batches
router.get('/get-batches', batchController.getBatches);
router.post('/create-batch', batchController.createBatch);
router.put('/edit-batch', batchController.editBatch);
router.delete('/delete-batch', batchController.deleteBatch);
router.get('/get-batches', batchController.getBatches);
router.post('/create-batch', batchController.createBatch);
router.put('/edit-batch', batchController.editBatch);
router.delete('/delete-batch', batchController.deleteBatch);

// Route to handle groups
router.post('/admins', groupController.createAdmin);
router.get('/admins', groupController.getAdmins);
router.get('/admins/:id', groupController.getAdminById);
router.put('/admins/:id', groupController.updateAdmin);
router.delete('/admins/:id', groupController.deleteAdmin);

// Coordinator routes
router.post('/coordinators', groupController.createCoordinator);
router.get('/coordinators', groupController.getCoordinators);
router.get('/coordinators/:id', groupController.getCoordinatorById);
router.put('/coordinators/:id', groupController.updateCoordinator);
router.delete('/coordinators/:id', groupController.deleteCoordinator);

// Trainer routes
router.post('/trainers', groupController.createTrainer);
router.get('/trainers', groupController.getTrainers);
router.get('/trainers/:id', groupController.getTrainerById);
router.put('/trainers/:id', groupController.updateTrainer);
router.delete('/trainers/:id', groupController.deleteTrainer);

module.exports = router;
