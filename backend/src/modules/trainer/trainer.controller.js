const { request } = require('express');
const db = require('../../config/db.config'); 
const { ObjectId } = require('mongodb');
const { Trainer } = require('../admin/models/trainer.model');
const { TrainingAssignment } = require('../coordinator/models/trainingassignment.model');
const { Subtopic, TrainingProgram, Topic } = require('../coordinator/models/trainingprogram.model');
const {createAssessmentReport} = require('../trainee/trainee.controller');
const { Op } = require('sequelize');

const saveQuestionsAnswers = async (req, res) => {
  try {
    const { category, datasetName, questions, trainingProgram } = req.body;
    const collection = db.mongoDB.collection('QuestionAnswers');

    // Check if datasetName already exists
    const existingDocument = await collection.findOne({ datasetName });

    if (existingDocument) {
      return res.status(400).json({ message: 'Dataset name already exists' });
    }

    const document = {
      category,
      datasetName,
      questions, 
      trainingProgram,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(document);

    res.status(201).json({ message: 'Questions saved successfully', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save questions', error });
  }
};
const fetchqaDataset =  async (req, res) => {
  const { datasetName } = req.params;
  const collection = db.mongoDB.collection('QuestionAnswers');

  try {
    const dataset = await collection.findOne({ datasetName });
    if (!dataset) {
      return res.status(404).json({ message: 'Dataset not found' });
    }
    res.json(dataset);
  } catch (error) {
    console.error('Error fetching dataset:', error);
    res.status(500).json({ message: 'Error fetching dataset' });
  }
};

const getAllDatasetNames = async (req, res) => {
  try {
    const collection = db.mongoDB.collection('QuestionAnswers');

    const datasets = await collection.aggregate([
      {
        $group: {
          _id: "$datasetName",
          category: { $first: "$category" },
          topic: { $first: "$topic" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" }
        }
      },
      {
        $project: {
          _id: 0,
          datasetName: "$_id",
          category: 1,
          topic: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]).toArray();

    res.status(200).json(datasets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dataset names', error });
  }
};

const updateDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, datasetName, topic, questions } = req.body;
    const collection = db.mongoDB.collection('QuestionAnswers');
    const result = await collection.updateMany(
      { _id: ObjectId.createFromHexString(id)},
      { 
        $set: { 
          category, 
          datasetName, 
          topic, 
          questions, 
          updatedAt: new Date() 
        } 
      }
    );

    res.status(200).json({ message: 'Dataset updated successfully', data: result });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error updating dataset', error });
  }
};

const deleteDataset = async (req, res) => {
  try {
    const { datasetName } = req.params;
    const questionAnswersCollection = db.mongoDB.collection('QuestionAnswers');
    const questionSetDetailsCollection = db.mongoDB.collection('QuestionSetDetails');

    const qaResult = await questionAnswersCollection.deleteMany({ datasetName });

    const qsdResult = await questionSetDetailsCollection.deleteMany({ dataset: datasetName });

    res.status(200).json({
      message: 'Dataset deleted successfully',
      data: {
        questionAnswers: qaResult,
        questionSetDetails: qsdResult,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting dataset', error });
  }
};

const fetchQuestionsAnswers = async (req, res) => {
  try {
    let collection = await db.mongoDB.collection("QuestionAnswers");
    let results = await collection.find({})
      .limit(50)
      .toArray();
    res.send(results).status(200);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch questions', error });
  }
};

async(req,res) => {
  const trainerName = req.query.userName;
  Trainer.findOne({
    attributes:[],
    include: [
      {
        model:TrainingAssignment,
        as: 'training_assignment',
        required: true,
        attributes: ['training_program_name','status'],
        include: [
          {
model:Subtopic,
as: 'subtopics',
required: true,
attributes : ['subtopic_name'],
on: {
  '$training_assignment.subtopic_id' :{[Op.eq]: db.sequelize.col('subtopic_id')}
}
          }
        ]
      }
    ]
  }).then(result =>{

  }).catch(error => {
    
  })
}

/**
 * Method to fetch Assessment Submissions that are marked for evaluation.
 * @param {*} req 
 * @param {*} res 
 */
const fetchAssessmentSubmissions= async (req, res)=> {
  const trainerName = req.query.trainerName;

  const rawResult =  await db.sequelize.query(`SELECT distinct training_programs.title as trainingProgram,"Assessments".title as assessment_name,"AssessmentAssignments".username as assigned_trainee,
"Assessments"."createdBy" as assigned_trainer, "Assessments".id as assessment_id, "Assessments"."passingCriteria", "AssessmentAssignments"."setObjectId" as qObjectId,
"AssessmentAssignments".id as assignment_id
  FROM 
    training_assignments ta1
  JOIN 
    training_programs ON ta1.trainingprogram_id = training_programs.trainingprogram_id
  JOIN 
    "Assessments" ON "Assessments"."trainingProgramId" = training_programs.trainingprogram_id
  JOIN 
    "AssessmentAssignments" ON "AssessmentAssignments"."assessmentId" = "Assessments".id 
	AND
	"AssessmentAssignments".status='Completed'
LEFT JOIN 
  "Assessment Reports" ON "Assessment Reports"."assignmentId" = "AssessmentAssignments".id
  WHERE
    ta1.trainer_name = '${trainerName}' 
	AND "Assessment Reports".id is null`,{ type: db.sequelize.QueryTypes.SELECT });

  console.log('Raw Result--->', rawResult);
  // const result = await TrainingAssignment.findAll({
  //   attributes:[],
  //   include:[{
  //     model:TrainingProgram,
  //     attributes:[['title','trainingProgram']],
  //     include:[{
  //       model:Topic,
  //       as:'topics',
  //       attributes:[['topic_name','topicName']],
  //       include:[{
  //         model:Subtopic,
  //         as:'subtopics',
  //         attributes:[['subtopic_name','subtopicName']],
  //         include:[{
  //           model:TrainingAssignment,
  //           as:'assignments',
  //           attributes:[['trainer_name','trainerName']],
  //           required:true,
  //           include:[{
  //             model:db.assessment,
  //             as: 'assessments',
  //             attributes:[['title','assessmentName'],'id'],
  //             required:true,
  //             include:[{
  //               model:db.assessmentAssignment,
  //               as:'assessment_assignments',
  //               attributes:[['username','traineeName'],'setObjectId'],
  //               required:true,
  //               include:[{
  //                 model:db.assessmentReports,
  //                 as:'assessment_reports',
  //                 attributes:['assessmentId'],
  //                 required:false,
  //                 where:{
  //                   id:{
  //                     [Op.ne]:null,
  //                   }
  //                 }
  //               }]
  //             }]
  //           }]
  //         }]
  //       }]
  //     },
  //   ]
  //   }],
  //   where:{
  //     trainer_name:{
  //       [Op.eq]: trainerName,
  //     }

  //   },
  // });

  // console.log(result);

  // const submissions = db.mongoDB.collection("AssessmentSubmission");
  // await submissions.find({
  //   markForEvaluation:true,
  //   assessmentId:{
  //     $in: result.map(rec=>rec.assessmentId)
  //   }
  // })
  res.status(200).json(rawResult);
}

const fetchAssessmentSubmissionById = async (req,res) => {
  const {assessmentId,userName,objectId} = req.query;
  // const assessmentId = req.params.assessmentId;
  // const userName = req.params.traineeName;
  // const objectId = req.params.objectId;

  const submissions = db.mongoDB.collection("AssessmentSubmission");
  const questionSets = db.mongoDB.collection("QuestionSetDetails");

  const submission = await submissions.findOne({
    assessmentId,
    userName,
    markForEvaluation:true
  });

  const questionSet = await questionSets.findOne({
    _id:ObjectId.createFromHexString(objectId),
  });

  res.json({submission,questionSet});
}

const {evaluateAssessment}  = require('../trainee/trainee.controller')
const evaluationReport = async () => {
  
}

const submitEvaluation = async(req,res) => {
  const t = await db.sequelize.transaction();
  let {assignmentId, passingCriteria, submissionData} = req.body;
  let marks = 0;
  submissionData.qaDataset.forEach(set=>{
    marks = set.isApproved===true?++marks:marks;
  });

  const objectId = submissionData._id;
  delete submissionData._id;

  marks = Math.floor(((marks/submissionData.qaDataset.length)*100).toFixed(2));
  try{
    await createAssessmentReport(submissionData.assessmentName, passingCriteria, assignmentId, marks, submissionData.userName, submissionData.feedback);

  const assessmentSubmissions = db.mongoDB.collection("AssessmentSubmission");
  await assessmentSubmissions.updateOne({_id:ObjectId.createFromHexString(objectId)},{$set:{...submissionData}});
  await t.commit();
} catch(error){
    console.log(error);
    await t.rollback();
    res.status(500).json({message:'Error Occured submitting the evaluation.'})
  }

  res.status(200).json({message:"Assessment Evaluated and Submitted Successfully."})
}

module.exports = { saveQuestionsAnswers,
  getAllDatasetNames,
  updateDataset,
  deleteDataset,
  fetchqaDataset,
  fetchQuestionsAnswers,
  fetchAssessmentSubmissions,
  fetchAssessmentSubmissionById,
  submitEvaluation
 };