const db = require('../../../config/db.config');
const { DataTypes } = require('sequelize');


const FileUpload = db.sequelize.define("FileUpload", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  uploadedBy: {
    type: DataTypes.STRING,
    allowNull: false
  },
  trainingProgram: {
    type: DataTypes.STRING,
    allowNull: false
  },
  trainingprogram_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'training_programs',
      key: 'trainingprogram_id'
    }
  },
  createdDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = FileUpload;