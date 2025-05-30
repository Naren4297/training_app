const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TrainingTopic = sequelize.define('TrainingTopic', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    training_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true
    },
    training_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'training_topics',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: (trainingTopic, options) => {
        trainingTopic.created_by = options.user;
        trainingTopic.updated_by = options.user;
      },
      beforeUpdate: (trainingTopic, options) => {
        trainingTopic.updated_by = options.user;
      }
    }
  });

  // TrainingTopic.associate = (models) => {
  //   TrainingTopic.hasMany(models.Subtopic, {
  //     foreignKey: 'training_topic_id',
  //     as: 'subtopics'
  //   });
  // };

  return TrainingTopic;
};