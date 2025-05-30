const { TrainingProgram, Topic, Subtopic, MockProject, getTopicHierarchy } = require('../models/trainingprogram.model');
const FileUpload = require('../models/fileupload.model')
const db = require('../../../config/db.config');
const {Op, where} = require('sequelize');
const dayjs = require('dayjs');
const { TrainingAssignment } = require('../models/trainingassignment.model');
const { Batch } = require('../../admin/models/batches.model');
const { Trainee } = require('../../admin/models/trainee.model');

const sequelize = db.sequelize;

// Helper function to validate and sanitize input data
const sanitizeTrainingProgramData = (generalInfo = {}, duration = {}) => ({
    title: generalInfo?.title?.toString() || '',
    description: generalInfo?.description?.toString() || '',
    targetAudience: generalInfo?.targetAudience?.toString() || '',
    trainingMethods: Array.isArray(generalInfo?.trainingMethods) 
        ? generalInfo.trainingMethods.filter(Boolean)
        : [],
    assessmentRequired: Boolean(generalInfo?.assessmentRequired),
    level: generalInfo?.level?.toString() || '',
    programType: generalInfo?.programType?.toString() || '',
    location: generalInfo?.location?.toString() || '',
    prerequisites: generalInfo?.prerequisites?.toString() || '',
    start_date: generalInfo?.startDate ? new Date(generalInfo.startDate) : null,
    end_date: generalInfo?.endDate ? new Date(generalInfo.endDate) : null,
    duration: Number.isInteger(parseInt(duration?.programDuration))
        ? parseInt(duration.programDuration)
        : 0
});

exports.createTrainingProgram = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {username} = req.user
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { generalInfo = {}, trainingPlan = {}, duration = {} } = data || {};
        const { mockProject = {} } = trainingPlan || {};

        // Create training program
        // const program = await TrainingProgram.create(
        //     sanitizeTrainingProgramData(generalInfo, duration),
        //     created_by: createdBy,
        //     { transaction }
        // );

        const program = await TrainingProgram.create(
            {
                ...sanitizeTrainingProgramData(generalInfo, duration),
                created_by: username
            },
            { transaction }
        );

        // Create mock project if provided
        if (mockProject?.name) {
            await MockProject.create({
                name: mockProject.name.toString(),
                description: mockProject.description?.toString() || '',
                trainingprogram_id: program.trainingprogram_id
            }, { transaction });
        }

        // Handle training plan (topics and subtopics)
        if (Array.isArray(trainingPlan?.mainTopics)) {
            await Promise.all(trainingPlan.mainTopics.map(async (topicData, topicIndex) => {
                if (!topicData?.name) return;

                // Create topic
                const topic = await Topic.create({
                    topic_name: topicData.name.toString(),
                    description: topicData.description?.toString() || '',
                    trainingprogram_id: program.trainingprogram_id
                }, { transaction });

                // Handle subtopics
                if (Array.isArray(topicData?.subTopics)) {
                    await Promise.all(topicData.subTopics.map(async (subTopicData, subTopicIndex) => {
                        if (!subTopicData?.name) return;

                        await Subtopic.create({
                            topic_id: topic.topic_id,
                            subtopic_name: subTopicData.name.toString(),
                            description: subTopicData.description?.toString() || '',
                            agenda: subTopicData?.agenda?.toString() || '',
                            hours: Number.isFinite(parseFloat(subTopicData?.hours))
                                ? parseFloat(subTopicData.hours)
                                : 0,
                            order_sequence: subTopicIndex + 1
                        }, { transaction });
                    }));
                }
            }));
        }

        // Fetch complete program with topics, subtopics, and mock project
        const completeProgram = await TrainingProgram.findByPk(program.trainingprogram_id, {
            include: [{
                model: Topic,
                as: 'topics',
                include: [{
                    model: Subtopic,
                    as: 'subtopics',
                    order: [['order_sequence', 'ASC']]
                }]
            }, {
                model: MockProject,
                as: 'mockProject'  // Include MockProject in the response
            }],
            transaction
        });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Training program created successfully',
            data: completeProgram
        });
    } catch (error) {
        await transaction.rollback();

        console.error('Error creating training program:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create training program',
            error: {
                message: error.message,
                type: error.name,
                details: error.errors?.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            }
        });
    }
};

exports.getAllTrainingPrograms = async (req, res) => {
    try {
        let {modelName,username} = req.user;
        modelName = modelName?.toLowerCase();

        // model='trainee';
        const { page = 1, limit = 10, search} = req.query;
        const offset = (page - 1) * limit;

        const include = [ {
            model: Topic,
            as: 'topics',
            include: [{
                model: Subtopic,
                as: 'subTopics',
                order: [['order_sequence', 'ASC']]
            }]
        }, {
            model: MockProject, // Include MockProject
            as: 'mockProject'
        }];

        const params = {
            where: search ? {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ]
            } : modelName==='coordinator'? {
                created_by : {
                    [Op.eq] : username,
                }
            } : {},
            include: modelName==='trainer' ? [...include, {
                model: TrainingAssignment,
                as: 'assignments',
                where:{
                    trainer_name: username,
                },
            }]: modelName === 'trainee' ? [...include, {
                model: TrainingAssignment,
                as: 'assignments',
                attributes: [],
                where:{
                    trainer_name: username,
                },
                include:[{
                    model:Batch,
                    as: 'batches',
                    attributes:[],
                    include:[{
                        model:Trainee,
                        as:'trainees',
                        attributes:[],
                        where:{
                            name:username,
                        }
                    }]

                }]
            }]:[...include]
        }

        const[programs] = await Promise.all([
            TrainingProgram.findAndCountAll(params)
        ]);

        // const [programs] = await Promise.all([
        //     TrainingProgram.findAndCountAll({
        //         where: whereClause,
        //         include: [ {
        //             model: Topic,
        //             as: 'topics',
        //             include: [{
        //                 model: Subtopic,
        //                 as: 'subTopics',
        //                 order: [['order_sequence', 'ASC']]
        //             }]
        //         }, {
        //             model: MockProject, // Include MockProject
        //             as: 'mockProject'
        //         }],
        //         limit: parseInt(limit),
        //         offset: offset,
        //         order: [['createdAt', 'DESC']]
        //     })
        //     // ,
        //     // getTopicHierarchy()
        // ]);

        console.log(programs);
        const formattedPrograms = programs.rows.map(program => {
            const mockProject = program.mockProject || {}; // Ensure mockProject is not null

            return {
                generalInfo: {
                    trainingprogram_id: program.trainingprogram_id,
                    title: program.title,
                    description: program.description,
                    status: program.status,
                    targetAudience: program.targetAudience,
                    trainingMethods: program.trainingMethods,
                    assessmentRequired: program.assessmentRequired,
                    level: program.level,
                    programType: program.programType,
                    location: program.location,
                    prerequisites: program.prerequisites,
                    startDate: program.start_date,
                    endDate: program.end_date
                },
                trainingPlan: {
                    mainTopics: program.topics.map(topic => ({
                        id: topic.topic_id,
                        name: topic.topic_name,
                        description: topic.description,
                        subTopics: topic.subTopics.map(subtopic => ({
                            id: subtopic.subtopic_id,
                            name: subtopic.subtopic_name,
                            description: subtopic.description,
                            status: subtopic.status,
                            completed: subtopic.completed,
                            hours: subtopic.hours,
                            agenda: subtopic.agenda,
                            order_sequence: subtopic.order_sequence
                        }))
                    })),
                    mockProject: {
                        name: mockProject.name || '', // Default to empty string if mockProject is undefined
                        description: mockProject.description || '' // Default to empty string if mockProject is undefined
                    }
                },
                duration: {
                    programDuration: program.duration
                },
                resources: []
            };
        });

        res.json({
            success: true,
            data: {
                programs: formattedPrograms,
                total: programs.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(programs.count / limit),
            }
        });
    } catch (error) {
        console.error('Error fetching training programs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training programs',
            error: error.message
        });
    }
};

// get ALL the training Program and assessments details
exports.getAllTrainingProgramsAssessment = async (req, res) => {
    try {
        // Filter completed Training programs
        const whereClause = { 
            status:  {
                [Op.or]: ['Completed'],
            }
        };
        const [programs] = await Promise.all([
            TrainingProgram.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: db.assessment,
                        as: 'assessment',
                        include: [{
                            model: db.assessmentAssignment,
                            as: 'assessment_assignments',
                            include: [{
                                model: db.assessmentReports,
                                as: 'assessment_reports'
                            }]
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']]
            })
        ]);

        const formattedPrograms = programs.rows.map(program => {
            const assessments = program.assessment || [];
            return {
                generalInfo: {
                    trainingprogram_id: program.trainingprogram_id,
                    title: program.title
                },
                assessment: assessments.map(assessment => ({
                    id: assessment.id || '',
                    title: assessment.title || '',
                    assignToUser: assessment.assignToUser || '',
                    assignToBatch: assessment.assignToBatch || '',
                    trainer: assessment.trainer || '',
                    assessmentsAssignments: (assessment.assessment_assignments || []).map(assignment => ({
                        id: assignment.id || '',
                        assessmentId: assignment.assessmentId || '',
                        qadatasetName: assignment.qadatasetName || '',
                        username: assignment.username || '',
                        status: assignment.status || '',
                        assessmentsReports: assignment.assessment_reports ? [assignment.assessment_reports] : []
                    }))
                })),
                duration: {
                    programDuration: program.duration
                },
                resources: []
            };
        });

        // Log the formatted programs to inspect the final structure
        // console.log('The final formattedPrograms');
        // console.log(JSON.stringify(formattedPrograms, null, 2));

        res.json({
            success: true,
            data: {
                programs: formattedPrograms,
                total: programs.count
            }
        });
    } catch (error) {
        console.error('Error fetching training programs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training programs',
            error: error.message
        });
    }
};

exports.getTrainingPrograms = async(req,res) => {
    try {
        let {modelName,username} = req.user;
        modelName = modelName?.toLowerCase();

        const include = [];

        const params = {
            where: modelName==='coordinator'? {
                created_by : {
                    [Op.eq] : username,
                }
            } : {},
            attributes: ['trainingprogram_id','title'],
            include: modelName==='trainer' ? [...include, {
                model: TrainingAssignment,
                as: 'assignments',
                where:{
                    trainer_name: username,
                },
            }]: modelName === 'trainee' ? [...include, {
                model: TrainingAssignment,
                as: 'assignments',
                attributes: [],
                where:{
                    trainer_name: username,
                },
                include:[{
                    model:Batch,
                    as: 'batches',
                    attributes:[],
                    include:[{
                        model:Trainee,
                        as:'trainees',
                        attributes:[],
                        where:{
                            name:username,
                        }
                    }]

                }]
            }]:[...include]
        }

        const programs = await TrainingProgram.findAndCountAll(params);
        res.status(200).json(programs);
    } catch(error) {
        console.log(error);
        res.status(500);
    }
}

// Get Training Program By ID
exports.getTrainingProgramByID = async (req, res) => {
    try {
        const program = await TrainingProgram.findByPk(req.params.id, {
            include: [
                {
                    model: Topic,
                    as: 'topics',
                    include: [
                        {
                            model: Subtopic,
                            as: 'subTopics',
                            order: [['order_sequence', 'ASC']]
                        }
                    ]
                },
                {
                    model: MockProject,
                    as: 'mockProject'
                },
                {
                    model: FileUpload,
                    as: 'resources'
                }
            ]
        });

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Training program not found'
            });
        }

        const formattedProgram = {
            generalInfo: {
                trainingprogram_id: program.trainingprogram_id,
                title: program.title,
                description: program.description,
                targetAudience: program.targetAudience,
                trainingMethods: program.trainingMethods,
                assessmentRequired: program.assessmentRequired,
                level: program.level,
                programType: program.programType,
                location: program.location,
                prerequisites: program.prerequisites,
                startDate: program.start_date,
                endDate: program.end_date,
            },
            trainingPlan: {
                mainTopics: program.topics.map(topic => ({
                    id: topic.topic_id,
                    name: topic.topic_name,
                    description: topic.description,
                    subTopics: topic.subTopics.map(subtopic => ({
                        id: subtopic.subtopic_id,
                        name: subtopic.subtopic_name,
                        description: subtopic.description,
                        hours: subtopic.hours,
                        agenda: subtopic.agenda,
                        order_sequence: subtopic.order_sequence
                    }))
                })),
                mockProject: {
                    name: program.mockProject?.name || '',
                    description: program.mockProject?.description || ''
                }
            },
            duration: {
                programDuration: program.duration
            },
            resources: program.resources.map(file => ({
                name: file.fileName,
                url: file.fileUrl,
                size: file.fileSize,
                uploadedBy: file.uploadedBy,
                createdDate: file.createdDate
            }))
        };

        console.log(formattedProgram);

        res.json({
            success: true,
            data: formattedProgram
        });
    } catch (error) {
        console.error('Error fetching training program by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training program',
            error: error.message
        });
    }
};

// Update Training Program By ID
exports.updateTrainingProgramByID = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { generalInfo = {}, duration = {}, trainingPlan = {}, updatedBy } = data;

        const program = await TrainingProgram.findByPk(req.params.id, { transaction });

        if (!program) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Training program not found'
            });
        }

        // Update the program details
        // await program.update(sanitizeTrainingProgramData(generalInfo, duration), { transaction });
        await program.update(
            {
                ...sanitizeTrainingProgramData(generalInfo, duration),
                updated_by: updatedBy
            },
            { transaction }
        );
        // Handle mock project update
        if (trainingPlan.mockProject) {
            const mockProject = await MockProject.findOne({
                where: { trainingprogram_id: req.params.id },
                transaction
            });
            if (mockProject) {
                await mockProject.update(trainingPlan.mockProject, { transaction });
            } else {
                await MockProject.create({
                    ...trainingPlan.mockProject,
                    trainingprogram_id: req.params.id
                }, { transaction });
            }
        }

        // Handle topics and subtopics
        if (Array.isArray(trainingPlan.mainTopics)) {
            await Promise.all(trainingPlan.mainTopics.map(async (topicData, topicIndex) => {
                if (!topicData?.name) return;

                // Update topic based on topic_id
                let topic = await Topic.findOne({
                    where: { topic_id: topicData.id, trainingprogram_id: req.params.id },
                    transaction
                });

                // If topic exists, update it; otherwise, create a new topic
                if (topic) {
                    await topic.update({
                        topic_name: topicData.name.toString(),
                        description: topicData.description?.toString() || ''
                    }, { transaction });
                } else {
                    topic = await Topic.create({
                        topic_name: topicData.name.toString(),
                        description: topicData.description?.toString() || '',
                        trainingprogram_id: req.params.id
                    }, { transaction });
                }

                // Handle subtopics
                if (Array.isArray(topicData?.subTopics)) {
                    await Promise.all(topicData.subTopics.map(async (subTopicData, subTopicIndex) => {
                        if (!subTopicData?.name) return;

                        let subtopic;
                        if (subTopicData.id) {
                            // Update existing subtopic
                            subtopic = await Subtopic.findOne({
                                where: {
                                    subtopic_id: subTopicData.id,
                                    topic_id: topic.topic_id
                                },
                                transaction
                            });

                            if (subtopic) {
                                await subtopic.update({
                                    subtopic_name: subTopicData.name.toString(),
                                    description: subTopicData.description?.toString() || '',
                                    agenda: subTopicData?.agenda?.toString() || '',
                                    hours: Number.isFinite(parseFloat(subTopicData?.hours)) ? parseFloat(subTopicData.hours) : 0,
                                    order_sequence: subTopicIndex + 1
                                }, { transaction });
                            }
                        } else {
                            // Create new subtopic
                            await Subtopic.create({
                                topic_id: topic.topic_id,
                                subtopic_name: subTopicData.name.toString(),
                                description: subTopicData.description?.toString() || '',
                                agenda: subTopicData?.agenda?.toString() || '',
                                hours: Number.isFinite(parseFloat(subTopicData?.hours)) ? parseFloat(subTopicData.hours) : 0,
                                order_sequence: subTopicIndex + 1
                            }, { transaction });
                        }
                    }));
                }
            }));
        }

        // Commit the transaction
        await transaction.commit();

        res.json({
            success: true,
            message: 'Training program updated successfully',
            data: {trainingprogram_id:req.params.id}
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating training program:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update training program',
            error: error.message
        });
    }
};



// Delete Training Program By ID
exports.deleteTrainingProgramByID = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const program = await TrainingProgram.findByPk(req.params.id, { transaction });

        if (!program) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Training program not found'
            });
        }

        await program.destroy({ transaction });
        await transaction.commit();

        res.json({
            success: true,
            message: 'Training program deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting training program:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete training program',
            error: error.message
        });
    }
};

exports.getTopicsByTrainingProgram = async (req, res) => {
    try {
        const { trainingprogram_id } = req.params;

        const trainingProgram = await TrainingProgram.findOne({
            where: { trainingprogram_id },
            include: [{
                model: Topic,
                as: 'topics',
                include: [{
                    model: Subtopic,
                    as: 'subTopics'
                }]
            }]
        });

        if (!trainingProgram) {
            return res.status(404).json({
                success: false,
                message: 'Training program not found'
            });
        }

        const formattedTopics = trainingProgram.topics.map(topic => ({
            id: topic.topic_id,
            name: topic.topic_name,
            description: topic.description,
            subTopics: topic.subTopics.map(subtopic => ({
                id: subtopic.subtopic_id,
                name: subtopic.subtopic_name,
                description: subtopic.description,
                hours: subtopic.hours,
                agenda: subtopic.agenda,
                order_sequence: subtopic.order_sequence
            }))
        }));

        res.json({
            success: true,
            data: {
                trainingProgram: {
                    id: trainingProgram.trainingprogram_id,
                    title: trainingProgram.title,
                    description: trainingProgram.description
                },
                topics: formattedTopics
            }
        });
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch topics',
            error: error.message
        });
    }
};

exports.getTrainingProgramsForCardData = async (req,res) => {
    TrainingProgram.findAll({
        attributes: [
            'title',
            'status',
            'createdAt',
        ],
        where:{
        created_by: req.query.userName
        },
        order:[
            ['title','ASC']
        ],
        group: ['TrainingProgram.title', 'TrainingProgram.status', 'TrainingProgram.createdAt']
    })
      .then(result => {
        let resultJSON = result.map(item=>item.toJSON());
        resultJSON = resultJSON.map(rec=>({
            ...rec,pending_assessments:parseInt(rec.pending_assessments)
                    }));
        let assigned = 0;
        let completed = 0;
        let inProgress = 0;
        let pending = 0;
        let labels = [];
        let data = [];

        const currentDate = new Date();
        resultJSON.forEach(program => {
          const status = program.status;
          const title = program.title;
          const createdDate = program.createdAt;

          if (status === 'Completed') {
            completed++;
          } else if (status === 'In Progress') {
            inProgress++;
            labels.push(title)
            let dateOfCreation = new Date(createdDate)
            let diffTime = currentDate - dateOfCreation;
          data.push(Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
        //   data.push(duration)
          } else if (status === 'Yet to start') {
            assigned++;
          } 
        });
        res.json({trainingsAssigned:assigned,
            trainingsCompleted:completed,
            inProgressTrainings:inProgress,
            pendingAssessments:pending,
            labels:labels,
            data:data
        })
      })
      .catch(error => {
        console.error('Error fetching training programs count:', error);
      });
}

//  ----------------------------- Mark Attendacne Logics -----------------------------------------------------

exports.updateSubtopicStatus = async (req, res) => {
    console.log('UPDATING SUBTOPICS----------------------------')
    const transaction = await sequelize.transaction();
    console.log(req.body);
    try {
        const { mainTopics } = req.body.updatedData.trainingPlan;
        if (!Array.isArray(mainTopics)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format'
            });
        }
        console.log(mainTopics);
        await Promise.all(
            mainTopics.map(async (topic) => {
                if (!Array.isArray(topic.subtopics)) return;
                console.log(topic.subtopics);
                await Promise.all(
                    topic.subtopics.map(async (subtopic) => {
                        console.log(subtopic);
                        if (subtopic.id||subtopic.subtopic_id) {
                            await Subtopic.update(
                                { completed: subtopic.completed, status: subtopic.completed ? 'Completed':'Yet to start'}, 
                                { where: { subtopic_id: (subtopic.id||subtopic.subtopic_id) }, transaction }
                            );
                        }
                    })
                );
            })
        );
        await transaction.commit();
        res.json({
            success: true,
            message: 'Subtopics updated successfully'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating subtopic status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update subtopics',
            error: error.message
        });
    }
};