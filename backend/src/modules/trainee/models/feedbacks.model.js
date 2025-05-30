module.exports = (sequelize, DataTypes) => {
    const Feedback = sequelize.define("Feedbacks", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      trainingProgram: {
        type: DataTypes.STRING,
        allowNull: true
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'feedbacks',
      timestamps: true
    });
  
    return Feedback;
  };
  