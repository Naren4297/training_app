const { DataTypes } = require('sequelize');
const db = require('../../../config/db.config');
const { Trainer } = require('../../admin/models/trainer.model');
const { Trainee } = require('../../admin/models/trainee.model');
const { Batch } = require('../../admin/models/batches.model');

const TrainingAssignment = db.sequelize.define('TrainingAssignment', {
    assignment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    trainingprogram_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    training_program_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    subtopic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    trainer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    trainer_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    batch_ids: {
        type: DataTypes.ARRAY(DataTypes.INTEGER), // Array of batch IDs
        allowNull: true,
    },
    batch_names: {
        type: DataTypes.ARRAY(DataTypes.STRING), // Array of batch names
        allowNull: true,
    },
}, {
    tableName: 'training_assignments',
    timestamps: true,
});

TrainingAssignment.belongsTo(Trainer, { foreignKey: 'trainer_id', as: 'trainer' });
Trainer.hasMany(TrainingAssignment, { foreignKey: 'trainer_id', onDelete: 'CASCADE', as: 'assignments' });

// Trainee.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });
// Batch.hasMany(Trainee, { foreignKey: 'batch_id', onDelete: 'CASCADE', as: 'trainees' });


// In TrainingAssignment model
TrainingAssignment.belongsToMany(Batch, {
    through: 'TrainingAssignmentBatch',  // Assuming a junction table
    foreignKey: 'trainingassignment_id',
    otherKey: 'batch_id',
    as: 'batches'  // <--- Alias defined here
});


// In Batch model
Batch.belongsToMany(TrainingAssignment, {
    through: 'TrainingAssignmentBatch',
    foreignKey: 'batch_id',
    otherKey: 'trainingassignment_id',
    as: 'assignments'
});

// async function syncModels() {
//     try {
//         await db.sequelize.sync({alter:true});
//         // await createTopicHierarchyView();
//         console.log('Assignemnt Models synchronized successfully');
//     } catch (error) {
//         console.error('Error synchronizing Assignemnt program models:', error);
//     }
// }
// syncModels();

module.exports = {
    TrainingAssignment,
};