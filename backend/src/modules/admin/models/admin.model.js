const { DataTypes } = require('sequelize');
const db = require('../../../config/db.config');

const Admin = db.sequelize.define('Admin', {
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
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  modifiedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'admins',
  timestamps: true,
  hooks: {
    beforeCreate: function(admin) {
      admin.email = admin.email.toLowerCase();
      return admin;
    }
  }
});

// db.sequelize.sync({force:true});

module.exports = { Admin };