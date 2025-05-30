module.exports = (sequelize, DataTypes) => {
  const Assessment = sequelize.define("Assessment", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true // Need to be false after configuring the user authentication 
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    questionSetsCount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    shuffle: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    customize: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    dataset: {
      type: DataTypes.STRING,
      allowNull: false
    },
    assignToBatch: {
      type: DataTypes.STRING,
      allowNull: true
    },
    assignToUser: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passingCriteria: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    trainer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    topics: {
      type: DataTypes.JSON,
      allowNull: true
    },
    trainingProgramId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    questionSetID:{
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return Assessment;
};