const { DataTypes } = require('sequelize');
const db = require('../../../config/db.config');

const Coordinator = db.sequelize.define('Coordinator', {
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
  tableName: 'coordinators',
  timestamps: true,
  hooks: {
    beforeCreate: function(coordinator) {
      coordinator.email = coordinator.email.toLowerCase();
      return coordinator;
    }
  }
});
// db.sequelize.sync({force:true});
module.exports = { Coordinator };