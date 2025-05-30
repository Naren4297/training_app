const sequelize = require('./dbtemp.config.js');
// Mongodb connection
const { MongoClient } = require('mongodb');
const dotenv = require("dotenv");
const { DataTypes } = require('sequelize');
dotenv.config();

// const sequelize = new Sequelize(
//   `postgres://postgres:${encodeURIComponent(process.env.DB_PASSWORD)}@${
//     process.env.DB_HOST
//   }:${process.env.DB_PORT}/${process.env.DB_NAME}`,
//   { dialect: "postgres" }
// );

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log(`Database connected to discover`);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const db = {};
// db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.trainees = require("../modules/trainee/models/trainee.model")(sequelize, DataTypes);
db.feedbacks = require("../modules/trainee/models/feedbacks.model")(sequelize, DataTypes);
db.assessmentReports = require("../modules/trainee/models/assessmentReport.model")(sequelize, DataTypes);
db.groups = require("../modules/admin/models/groups.model")(sequelize, DataTypes);
db.assessment = require("../modules/coordinator/models/assessment.model")(sequelize, DataTypes);

// to create the table if not exists, else alter if any changes
// db.batches.sync({ alter: true });

db.createDefaultGroups = (groups) => {
  const defaultGroups = [
    { group_name: 'admin', users: [], createdBy: 'System', updatedBy: 'System' },
    { group_name: 'co-ordinator', users: [], createdBy: 'System', updatedBy: 'System' },
    { group_name: 'trainer', users: [], createdBy: 'System', updatedBy: 'System' },
    { group_name: 'trainee', users: [], createdBy: 'System', updatedBy: 'System' },
  ];

  groups.sync({ alter: true }).then(async () => {
    const count = await groups.count();
    if (count === 0) {
      await groups.bulkCreate(defaultGroups);
      console.log('Default groups have been added.');
    } else {
      console.log('Groups already exist.');
    }
  }).catch(error => {
    console.error('Unable to sync the database:', error);
  });
}
// db.assessment.sync({ alter: true });
// batch.sync({alter:true});
// db.qaInfo.sync({ alter: true });
// db.trainingprogram = require("../modules/co-ordinator/models/trainingprogram.model");//(sequelize, DataTypes);
db.assessmentAssignment = require("../modules/trainee/models/assessmentAssignment.model")(sequelize, DataTypes);

// mongoDB connection
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

db.assessment.hasMany(db.assessmentAssignment,{
  foreignKey: 'assessmentId',
  as: 'assessment_assignments',
  onDelete: 'CASCADE',
});

db.assessmentAssignment.hasOne(db.assessmentReports,{
  foreignKey: 'assignmentId',
  as: 'assessment_reports',
});

db.assessmentAssignment.belongsTo(db.assessment,{
  foreignKey:'assessmentId',
  as:'assessments'
});

// db.assessmentAssignment.belongsTo(db.Trainee,{
//   foreignKey:'trainee_id',
//   as:'trainees'
// });

// db.assessmentAssignment.belongsTo(db.Trainer,{
//   foreignKey:'trainer_id',
//   as:'trainers'
// });

db.assessmentReports.belongsTo(db.assessmentAssignment,{
  foreignKey:'assignmentId',
  as:'assignment_reports'
});

// db.Trainee.hasMany(db.assessmentAssignment,{
//   foreignKey: 'trainee_id',
//   as:'assessment_assignments'
// });

// db.Trainer.hasMany(db.assessmentAssignment,{
//   foreignKey: 'trainer_id',
//   as:'assessment_assignment'
// })

async function connectMongoDB() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    const mongoDB = client.db(process.env.DB_NAME);
    db.mongoDB = mongoDB;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
}

connectMongoDB();
module.exports = db;
