const { DataTypes } = require('sequelize');
// const sequelize = require('../../../config/dbtemp.config');
const db = require('../../../config/db.config');
const { Trainee } = require('./trainee.model');

const Batch = db.sequelize.define('Batch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
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
  joined_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  traineesCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'batches',
  timestamps: true,
});

Batch.hasMany(Trainee, { as: 'batchTrainees', foreignKey: 'batchId' });
Trainee.belongsTo(Batch, { as: 'batchDetails', foreignKey: 'batchId' });

// db.sequelize.sync({force:true});

module.exports = { Batch };
