const Subtopic = require('../models/Subtopic');

// Create a new subtopic
exports.createSubtopic = async (req, res) => {
    try {
        const subtopic = await Subtopic.create(req.body);
        res.status(201).json(subtopic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update an existing subtopic
exports.updateSubtopic = async (req, res) => {
    try {
        const subtopic = await Subtopic.findByPk(req.params.id);
        if (!subtopic) {
            return res.status(404).json({ error: 'Subtopic not found' });
        }
        await subtopic.update(req.body);
        res.status(200).json(subtopic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a subtopic
exports.deleteSubtopic = async (req, res) => {
    try {
        const subtopic = await Subtopic.findByPk(req.params.id);
        if (!subtopic) {
            return res.status(404).json({ error: 'Subtopic not found' });
        }
        await subtopic.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};