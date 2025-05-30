const { DataTypes } = require('sequelize');
const db = require('../../../config/db.config');

const Trainer = db.sequelize.define('Trainer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expertise: {
    type: DataTypes.STRING,
    allowNull: true,
},
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
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
  tableName: 'trainers',
  timestamps: true,
  hooks: {
    beforeCreate: function(trainer) {
      trainer.email = trainer.email.toLowerCase();
      return trainer;
    }
  }
});

// db.sequelize.sync({force:true});
module.exports = { Trainer };