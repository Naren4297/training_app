//trainee model
module.exports = (sequelize, DataTypes) => {
    const Trainee = sequelize.define( "Trainees", {
        traineeName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            isEmail: true,
            allowNull: false
        },
        batchName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        deptName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {timestamps: true}, )
    return Trainee
 }