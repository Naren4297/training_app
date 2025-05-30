const express = require('express');
const router = express.Router();
const trainingTrackerController = require('./trainingTracker.controller.js');

router.post('', trainingTrackerController.create);
router.get('', trainingTrackerController.findAll);
router.put('/:id', trainingTrackerController.update);
router.delete('/:id', trainingTrackerController.delete);

module.exports = router;