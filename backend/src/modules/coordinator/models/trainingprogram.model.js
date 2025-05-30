const { DataTypes, QueryTypes } = require('sequelize');
const TrainingAssignment = require('../models/trainingassignment.model').TrainingAssignment;
const FileUpload = require('../models/fileupload.model');
const db = require('../../../config/db.config');

// Define models
const TrainingProgram = db.sequelize.define('TrainingProgram', {
    trainingprogram_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: { 
        type: DataTypes.STRING, 
        allowNull: false,
        defaultValue: '' 
    },
    description: { 
        type: DataTypes.TEXT,
        defaultValue: '' 
    },
    targetAudience: { 
        type: DataTypes.STRING,
        defaultValue: '' 
    },
    trainingMethods: { 
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        get() {
            const value = this.getDataValue('trainingMethods');
            return value ? value : [];
        }
    },
    assessmentRequired: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false 
    },
    level: { 
        type: DataTypes.STRING,
        defaultValue: '' 
    },
    programType: { 
        type: DataTypes.STRING,
        defaultValue: '' 
    },
    location: { 
        type: DataTypes.STRING,
        defaultValue: '' 
    },
    prerequisites: { 
        type: DataTypes.TEXT,
        defaultValue: '' 
    },
    duration: { 
        type: DataTypes.INTEGER,
        defaultValue: 0,
        get() {
            const value = this.getDataValue('duration');
            return value ? value : 0;
        }
    },
    status: {
        type: DataTypes.ENUM('Completed', 'Yet to start', 'In Progress'),
        allowNull: false,
        defaultValue: 'Yet to start'
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: 'training_programs',
    timestamps: true
});

const Topic = db.sequelize.define('Topic', {
    topic_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    topic_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    trainingprogram_id: { // Add this field to link to TrainingProgram
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'topics',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['topic_name']
        }
    ]
});

const Subtopic = db.sequelize.define('Subtopic', {
    subtopic_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subtopic_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    order_sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    hours: {
        type: DataTypes.FLOAT, // Allows for fractional hours
        allowNull: false,
        defaultValue: 0
    },
    agenda: {
        type: DataTypes.TEXT, // Text type for detailed agendas
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Completed', 'Yet to start'),
        allowNull: false,
        defaultValue: 'Yet to start'
    },
    completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
    tableName: 'subtopics',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['topic_id']
        }
    ]
});

// Define the MockProject model
const MockProject = db.sequelize.define('MockProject', {
    mockproject_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    trainingprogram_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'mock_projects',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Define relationships
Topic.hasMany(Subtopic, {
    foreignKey: 'topic_id',
    sourceKey: 'topic_id',
    as: 'subtopics'
});

Subtopic.belongsTo(Topic, {
    foreignKey: 'topic_id',
    targetKey: 'topic_id',
    as: 'topic'
});

TrainingProgram.hasMany(Topic, { 
    as: 'topics',
    foreignKey: 'trainingprogram_id',
    onDelete: 'CASCADE'
});

Topic.belongsTo(TrainingProgram, {
    foreignKey: 'trainingprogram_id'
});

Topic.hasMany(Subtopic, { 
    as: 'subTopics',
    foreignKey: 'topic_id',
    onDelete: 'CASCADE'
});

Subtopic.belongsTo(Topic, {
    foreignKey: 'topic_id'
});

TrainingProgram.hasOne(MockProject, {
    foreignKey: 'trainingprogram_id',
    onDelete: 'CASCADE',
    as: 'mockProject' // Use the custom alias here
});

MockProject.belongsTo(TrainingProgram, {
    foreignKey: 'trainingprogram_id',
    as: 'mockProject' // Use the same alias here
});

// ------------------- Training Assignment Relationship ---------------------------------------------

TrainingProgram.hasMany(TrainingAssignment, {
    foreignKey: 'trainingprogram_id',
    onDelete: 'CASCADE',
    as: 'assignments'
});

TrainingAssignment.belongsTo(TrainingProgram, {
    foreignKey: 'trainingprogram_id',
    as: 'training_programs'
});

TrainingProgram.hasMany(db.assessment, {
    foreignKey: 'trainingProgramId',
    onDelete: 'CASCADE',
    as: 'assessments'
});

db.assessment.belongsTo(TrainingProgram, {
    foreignKey: 'trainingProgramId',
    as: 'assessments',
});

Topic.hasMany(TrainingAssignment, {
    foreignKey: 'topic_id',
    onDelete: 'CASCADE',
    as: 'assignments'
});

TrainingAssignment.belongsTo(Topic, {
    foreignKey: 'topic_id',
    as: 'topic'
});

Subtopic.hasMany(TrainingAssignment, {
    foreignKey: 'subtopic_id',
    onDelete: 'CASCADE',
    as: 'assignments'
});

TrainingAssignment.belongsTo(Subtopic, {
    foreignKey: 'subtopic_id',
    as: 'subtopic'
});

// Added to invoke relationship between Training program and assessment

TrainingProgram.hasMany(db.assessment, {
    foreignKey: 'trainingProgramId',
    onDelete: 'CASCADE',
    as: 'assessment',
});

db.assessment.belongsTo(TrainingProgram, {
    foreignKey: 'trainingProgramId',
    as: 'trainingassessment',
}
);

//
// ------------------- File Upload Relationship ---------------------------------------------

TrainingProgram.hasMany(FileUpload, { as: 'resources', foreignKey: 'trainingprogram_id' });
FileUpload.belongsTo(TrainingProgram, { foreignKey: 'trainingprogram_id' });

async function getTopicHierarchy() {
    try {
        const topics = await Topic.findAll({
            include: [
                {
                    model: Subtopic,
                    as: 'subTopics',
                    attributes: ['subtopic_id', 'subtopic_name', 'description', 'order_sequence']
                }
            ],
            attributes: ['topic_id', 'topic_name', 'description'],
            order: [['topic_name', 'ASC'], ['subTopics', 'order_sequence', 'ASC']]
        });

        return topics.map(topic => ({
            topic_id: topic.topic_id,
            topic_name: topic.topic_name,
            topic_description: topic.description,
            subtopics: topic.subTopics.map(subtopic => ({
                subtopic_id: subtopic.subtopic_id,
                subtopic_name: subtopic.subtopic_name,
                description: subtopic.description,
                order_sequence: subtopic.order_sequence
            }))
        }));
    } catch (error) {
        console.error('Error fetching topic hierarchy:', error);
        throw error;
    }
}

async function syncModels() {
    try {
        // await TrainingProgram.sync({force:true});
        await db.sequelize.sync();
        // await createTopicHierarchyView();
        // console.log('Models synchronized successfully');
    } catch (error) {
        console.error('Error synchronizing training program models:', error);
    }
}

// syncModels();

module.exports = {
    TrainingProgram,
    Topic,
    Subtopic,
    MockProject,
    getTopicHierarchy
};