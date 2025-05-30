const {TrainingAssignment} = require('../models/trainingassignment.model')
const {Trainer} = require("../../admin/models/trainer.model")
const {Trainee} = require("../../admin/models/trainee.model")
const {Batch} = require("../../admin/models/batches.model")
const {Topic, Subtopic, TrainingProgram} = require("../models/trainingprogram.model");
const sequelize = require('../../../config/dbtemp.config');
const {getFilesFromS3ByProgramId} = require('./uploadFile.controller');
const FileUpload = require('../models/fileupload.model');
const { Op } = require('sequelize');


exports.createTrainingAssignment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { programId, programName, trainers, batches } = req.body.updatedData;

        // Extract batch IDs and names
        const batchIds = batches.map(batch => batch.batch_id);
        const batchNames = batches.map(batch => batch.name);

        if (!programId || !programName || !Array.isArray(trainers) || !Array.isArray(batches)) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Invalid input data' });
        }
        else {
        
        // Iterate through each topic and subtopic to create training assignments
        for (let trainer of trainers) {
            for (let subTopic of trainer.subTopics) {
                // Create assignment for each trainer and batch
                await TrainingAssignment.create({
                    trainingprogram_id: programId,
                    training_program_name: programName,
                    topic_id: trainer.topicId,
                    subtopic_id: subTopic.subTopicId,
                    trainer_id: subTopic.trainerId,
                    trainer_name: subTopic.trainerName,
                    batch_ids: batchIds,
                    batch_names: batchNames,
                }, { transaction });
            }
        }

        // Commit transaction
        await transaction.commit();
        res.status(200).json({ message: 'Training assignments created successfully.' });
    }
    } catch (error) {
        // Rollback in case of error
        await transaction.rollback();
        console.error('Error creating training assignment:', error);
        res.status(500).json({ error: 'Failed to create training assignment' });
    }
};

// Get all training assignments
// Backend: Modified getTrainingAssignments
exports.getTrainingAssignments = async (req, res) => {
    let {modelName, username} = req.user;
    modelName = modelName?.toLowerCase();
    const attributes = [
        'trainingprogram_id',
        'training_program_name',
        [sequelize.fn('array_agg', sequelize.col('batch_names')), 'batch_names'],
        [sequelize.fn('COUNT', sequelize.col('subtopic_id')), 'total_subtopics']
    ];

    const include = [{
        model:TrainingProgram,
        as:'training_programs',
        attributes:['description', 'trainingMethods', 'start_date']
    }];

    const group = ['training_programs.trainingprogram_id','TrainingAssignment.trainingprogram_id', 'TrainingAssignment.assignment_id', 'training_program_name'];

    const params = {
        attributes,
        where:modelName==='trainer' ? {
            trainer_name:username,
        }:{}, 
        include:modelName==='coordinator' ? [{...include[0],where:{
            created_by:username,
        }}] : modelName==='trainee' ? [...include,{
            model:Batch,
            as: 'batches',
            attributes:[],
            include:[{
                model:Trainee,
                as:'batchTrainees',
                attributes:[],
                where:{
                    name:username,
                }
            }]

        }] : [...include],
        group: modelName==='trainee'?[...group,'batches->TrainingAssignmentBatch.updatedAt', 'batches->TrainingAssignmentBatch.trainingassignment_id', 'batches->TrainingAssignmentBatch.batch_id','batches->TrainingAssignmentBatch.createdAt']:
        [...group],
        distinct:true
    }
    try {
        let assignments = await TrainingAssignment.findAll(params);
        console.log(assignments);
        const duplicateNames = [];
        assignments = assignments.filter(assignment=>{
            const programName = assignment.training_program_name
            if(!duplicateNames.includes(programName)) {
                duplicateNames.push(programName);
                return true;
            } else {
                return false;
            }
        });
        res.status(200).json(assignments);
    } catch (error) {
        console.error('Error fetching training assignments:', error);
        res.status(500).json({ error: 'Failed to retrieve training assignments' });
    }
};

// trainingassignment.controller.js
exports.getTrainingAssignmentDetails = async (req, res) => {
    try {
        const programId = req.params.id;

        const assignments = await TrainingAssignment.findAll({
            where: { trainingprogram_id: programId },
            include: [
                {
                    model: Trainer,
                    as: 'trainer',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Topic,
                    as: 'topic',
                    attributes: ['topic_id', 'topic_name', 'description']
                },
                {
                    model: Subtopic,
                    as: 'subtopic',
                    attributes: ['subtopic_id', 'subtopic_name', 'description', 'status', 'completed']
                }
            ],
            order: [['topic_id', 'ASC'], ['subtopic_id', 'ASC']]
        });

        const resources = await FileUpload.findAll({
            where:{
                trainingprogram_id : {
                    [Op.eq] : programId,
                }   
            },
            attributes : ['fileName','fileSize','fileUrl','uploadedBy','createdAt']
        })

        console.log(assignments);

        // Group assignments by topic
        const groupedAssignments = assignments.reduce((acc, assignment) => {
            if (!acc[assignment.topic_id]) {
                acc[assignment.topic_id] = {
                    topic_id: assignment.topic_id,
                    topic_name: assignment.topic.topic_name,
                    topic_description: assignment.topic.description,
                    subtopics: []
                };
            }

            console.log("Assignments-----------");
            console.log(assignment);

            acc[assignment.topic_id].subtopics.push({
                subtopic_id: assignment.subtopic_id,
                subtopic_name: assignment.subtopic.subtopic_name,
                subtopic_description: assignment.subtopic.description,
                status:assignment.subtopic.status,
                completed:assignment.subtopic.completed,
                trainer: {
                    id: assignment.trainer.id,
                    name: assignment.trainer.name,
                    email: assignment.trainer.email
                }
            });

            return acc;
        }, {});

        // Get program details from first assignment
        const programDetails = assignments[0] ? {
            program_id: assignments[0].trainingprogram_id,
            program_name: assignments[0].training_program_name,
            batch_names: assignments[0].batch_names,
            topics: Object.values(groupedAssignments)
        } : null;

        // const listData = await getFilesFromS3ByProgramId(programId);
        // const resources = listData?.Contents.map(list=>  {
        //     return({
        //         name:list.Key.split('/').pop(),
        //         size:list.Size,
        //         uploadedBy:list.uploadedBy,
        //         lastModified:list.LastModified,
        //     });
        // });
        programDetails.resources = resources?.map(file=>({
            name: file.fileName,
            url: file.fileUrl,
            size: file.fileSize,
            uploadedBy: file.uploadedBy,
            createdDate: file.createdDate
        }));
        res.status(200).json(programDetails);
    } catch (error) {
        console.error('Error fetching training assignment details:', error);
        res.status(500).json({ error: 'Failed to retrieve training assignment details' });
    }
};

// Get a single training assignment by ID
exports.getTrainingAssignmentByID = async (req, res) => {
    try {
        const assignment = await TrainingAssignment.findByPk(req.params.id);
        if (!assignment) {
            return res.status(404).json({ error: 'Training assignment not found' });
        }
        res.status(200).json(assignment);
    } catch (error) {
        console.error('Error fetching training assignment:', error);
        res.status(500).json({ error: 'Failed to retrieve training assignment' });
    }
};


// Updated getTrainingAssignmentDetails to match frontend structure
exports.getFormattedTrainingAssignmentDetails = async (req, res) => {
    try {
        const programId = req.params.id;

        const assignments = await TrainingAssignment.findAll({
            where: { trainingprogram_id: programId },
            include: [
                {
                    model: Trainer,
                    as: 'trainer',  // Ensure alias matches the model association
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Batch,
                    as: 'batches',  // Corrected alias to match model definition
                    attributes: ['batch_id', 'name']
                }
            ],
            order: [['assignment_id', 'ASC']]
        });

        if (!assignments || assignments.length === 0) {
            return res.status(404).json({ error: 'No training assignments found' });
        }

        // Extract data to match frontend formData structure
        const programDetails = {
            programId: assignments[0].trainingprogram_id,
            programName: assignments[0].training_program_name,
            trainers: assignments.map((assignment) => ({
                trainerId: assignment.trainer_id,
                trainerName: assignment.trainer_name,
            })),
            batches: assignments.flatMap((assignment) =>
                assignment.batches.map((batch) => ({
                    batch_id: batch.batch_id,
                    name: batch.name
                }))
            )
        };

        res.status(200).json(programDetails);
    } catch (error) {
        console.error('Error fetching training assignment details:', error);
        res.status(500).json({ error: 'Failed to retrieve training assignment details' });
    }
};


// Update a training assignment by ID
exports.updateTrainingAssignment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const assignment = await TrainingAssignment.findByPk(req.params.id);
        
        if (!assignment) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Training assignment not found' });
        }

        const { programId, programName, trainers, batches } = req.body.updatedData;

        // Extract batch IDs and names
        const batchIds = batches.map(batch => batch.batch_id);
        const batchNames = batches.map(batch => batch.name);

        if (!programId || !programName || !Array.isArray(trainers) || !Array.isArray(batches)) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Updating assignment with new values
        await assignment.update(
            {
                trainingprogram_id: programId,
                training_program_name: programName,
                batch_ids: batchIds,
                batch_names: batchNames,
            },
            { transaction }
        );

        await transaction.commit();
        res.status(200).json({ message: 'Training assignment updated successfully' });

    } catch (error) {
        await transaction.rollback();
        console.error('Error updating training assignment:', error);
        res.status(500).json({ error: 'Failed to update training assignment' });
    }
};


// Delete a training assignment by ID
// Backend: Add this function
exports.deleteTrainingAssignment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const programId = req.params.id;
        await TrainingAssignment.destroy({
            where: { trainingprogram_id: programId },
            transaction
        });
        await transaction.commit();
        res.status(200).json({ message: 'Training assignments deleted successfully.' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting training assignments:', error);
        res.status(500).json({ error: 'Failed to delete training assignments' });
    }
};