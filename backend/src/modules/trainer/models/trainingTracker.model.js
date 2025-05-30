const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TBD_TrainingTracker = sequelize.define('TrainingTracker', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subtopic: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Ongoing', 'Completed', 'Cancelled'),
      defaultValue: 'Ongoing'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
      beforeCreate: (trainingTracker, options) => {
        trainingTracker.createdBy = options.user; // Assuming `options.user` contains the user info
        trainingTracker.updatedBy = options.user;
      },
      beforeUpdate: (trainingTracker, options) => {
        trainingTracker.updatedBy = options.user;
      }
    }
  });

  return TBD_TrainingTracker;
};