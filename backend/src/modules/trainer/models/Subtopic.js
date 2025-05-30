const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subtopic = sequelize.define('TBD_Subtopic', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    training_topic_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'training_topics',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Ongoing', 'Completed', 'Cancelled'),
      defaultValue: 'Ongoing'
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'subtopics',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: (subtopic, options) => {
        subtopic.created_by = options.user;
        subtopic.updated_by = options.user;
      },
      beforeUpdate: (subtopic, options) => {
        subtopic.updated_by = options.user;
      }
    }
  });

  // Subtopic.associate = (models) => {
  //   Subtopic.belongsTo(models.TrainingTopic, {
  //     foreignKey: 'training_topic_id',
  //     as: 'trainingTopic'
  //   });
  // };

  return Subtopic;
};