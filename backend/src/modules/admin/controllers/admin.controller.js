const { Trainer } = require('../models/trainer.model');
const { Trainee } = require('../models/trainee.model');
const { Batch } = require('../models/batches.model');

// Fetch all trainers
exports.getTrainers = async (req, res) => {
    try {
        const trainers = await Trainer.findAll();
        res.status(200).json({
            success: true,
            data: trainers,
        });
    } catch (error) {
        console.error('Error fetching trainers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trainers',
            error: error.message,
        });
    }
};

// Fetch all trainees
exports.getTrainees = async (req, res) => {
    try {
        const trainees = await Trainee.findAll();
        res.status(200).json({
            success: true,
            data: trainees,
        });
    } catch (error) {
        console.error('Error fetching trainees:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trainees',
            error: error.message,
        });
    }
};

// Fetch all batches
exports.getBatches = async (req, res) => {
    try {
        const batches = await Batch.findAll({
            include: [
                { model: Trainee, as: 'batchTrainees' } // Assuming Batch model has an association with Trainee
            ],
        });
        res.status(200).json({
            success: true,
            data: batches,
        });
    } catch (error) {
        console.error('Error fetching batches:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch batches',
            error: error.message,
        });
    }
};
