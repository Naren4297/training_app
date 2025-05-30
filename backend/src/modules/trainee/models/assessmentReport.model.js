//assessmentReport model
module.exports = (sequelize, DataTypes) => {
    const assessmentReport = sequelize.define( "Assessment Reports", {
        assessmentName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        assignmentId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        traineeName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        marks: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        totalMarks: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        pass: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        feedback:{
            type:DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: true
      } )
    return assessmentReport
 }