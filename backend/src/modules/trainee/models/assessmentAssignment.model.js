module.exports = (sequelize, DataTypes) => {
    const AssessmentAssignment = sequelize.define("AssessmentAssignment", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      assessmentId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      setObjectId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      qadatasetName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'not completed'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },{
      timestamps: true
    });

    return AssessmentAssignment;
  };