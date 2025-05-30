const { DataTypes } = require('sequelize');
// const sequelize = require('../../../config/dbtemp.config');
const db = require('../../../config/db.config');

const Trainee = db.sequelize.define('Trainee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  batchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  batchName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  batchName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  modifiedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'trainees',
  timestamps: true,
  hooks: {
    beforeCreate: function(trainee) {
      trainee.email = trainee.email.toLowerCase();
      return trainee;
    },
    beforeUpdate: function(trainee) {
      trainee.email = trainee.email.toLowerCase();
      return trainee;
    }
  }
});

// db.sequelize.sync({force:true});
module.exports = { Trainee };