const { where,Op,col,fn,literal } = require('sequelize');
const db = require('../../config/db.config');

// Controller function to handle feedback form submission
const submitFeedback = async (req, res) => {
  try {
    const { name, rating, trainingProgram, comments } = req.body;
    const feedback = await db.feedbacks.create({
      name,
      trainingProgram,
      rating,
      comments
    });
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback', error });
  }
};

const submitAssessmentReport = async (req, res) => {
  try {
    const { assessmentName, userName, marks, totalMarks, pass, feedback } = req.body;
    const assessmentReport = await db.assessmentReports.create({
      assessmentName,
      userName,
      marks,
      totalMarks,
      pass,
      feedback
    });
    res.status(201).json({ message: 'Assessment Report submitted successfully', assessmentReport });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting Assessment Report', error });
  }
};

const getAssessmentReport = async (req, res) => {
  try {
    const{modelName, username} = req.user;
    const { assessmentName, userName } = req.query;

    if (!assessmentName) {
      return res.status(400).json({ error: 'assessmentName and userName are required' });
    }

    const collection = db.mongoDB.collection('AssessmentSubmission');
    const report = await collection.findOne({
      assessmentName,
      userName:username
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    return res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching assessment report:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to fetch questions, options, and answers
async function getDataset(req, res) {
  const query = 'SELECT question, options, answer FROM dataset';

  try {
    const result = await db.cassandraClient.execute(query);
    const dataset = result.rows;

    res.status(200).json({
      success: true,
      data: dataset
    });
  } catch (err) {
    console.error('Error fetching dataset:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dataset'
    });
  }
}

// Function to fetch assessment details from Assessment table
// Controller function to get assessment details
const getAssessmentDetails = async (req, res) => {
  const traineeName = req.query.userName;
  try {
    // Fetch assessments
    const assessments = await db.sequelize.models.Assessment.findAll({
      attributes: ['id', 'title', 'description', 'due_date']
    });

    // Fetch assessment assignments for the specific user
    const assessmentAssignments = await db.sequelize.models.AssessmentAssignment.findAll({
      where: { username: traineeName, status:'not completed' },
      attributes: ['assessmentId']
    });

    // Create a set of assessment IDs from the assignments
    const assignedAssessmentIds = new Set(assessmentAssignments.map(assignment => assignment.assessmentId));

    // Filter assessments based on the assigned assessment IDs
    const filteredAssessments = assessments.filter(assessment => assignedAssessmentIds.has(assessment.id));

    res.status(200).json(filteredAssessments);
  } catch (error) {
    console.error('Error fetching assessment details:', error);
    res.status(500).json({ message: 'Error fetching assessment details', error });
  }
};

module.exports = {
  // Other controller functions...
  getAssessmentDetails,
};

// Function to fetch a specific assessment by ID
const getAssessmentById = async (req, res) => {
  try {
    const { assessmentId } = req.query;

    if (!assessmentId) {
      return res.status(400).json({ error: 'assessmentId is required' });
    }

    const assessment = await db.sequelize.models.Assessment.findOne({
      where: { id: assessmentId },
      attributes: ['id', 'title', 'description', 'due_date', 'dataset']
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.status(200).json(assessment);
  } catch (error) {
    console.error('Error fetching assessment details:', error);
    res.status(500).json({ message: 'Error fetching assessment details', error });
  }
};

// get assessments under a training program
const getAssessmentByTrainingProgramID = async (req, res) => {
  try {
    const { trainingProgramId } = req.query;

    if (!trainingProgramId) {
      return res.status(400).json({ error: 'Training Program Id is required ', error});
    }

    const assessment = await db.sequelize.models.Assessment.findAll({
      where: { trainingProgramId: trainingProgramId },
      attributes: ['id', 'title', 'description', 'due_date', 'dataset']
    });

    if (!assessment) {
      return res.status(200).json({});
    }

    res.status(200).json(assessment);
  } catch (error) {
    console.error('Error fetching trainingProgram details:', error);
    res.status(500).json({ message: 'Error fetching trainingProgram details' });
  }
};

const { ObjectId } = require('mongodb');
const { Trainee } = require('../admin/models/trainee.model');
const { Batch } = require('../admin/models/batches.model');
const { model } = require('mongoose');
const { report } = require('./trainee.route');
const { TrainingAssignment } = require('../coordinator/models/trainingassignment.model');
const { TrainingProgram, Subtopic } = require('../coordinator/models/trainingprogram.model');
const { Json } = require('sequelize/lib/utils');

const startAssessment = async (req, res) => {
  const { assessmentId, username } = req.body;

  try {
    // Check if the assessment assignment already exists and is not completed
    const existingAssignment = await db.assessmentAssignment.findOne({
      where: { assessmentId, username, status: 'not completed' }
    });

    if (existingAssignment) {
      // Fetch the question set from MongoDB
      const questionSet = await db.mongoDB.collection('QuestionSetDetails').findOne({ _id: new ObjectId(existingAssignment.setObjectId.replace(/"/g, '')) });
      return res.status(200).json(questionSet.qaDataset);
    }

    // Fetch all question sets for the assessment from MongoDB
    const questionSets = await db.mongoDB.collection('QuestionSetDetails').find({ assessmentId }).toArray();

    if (questionSets.length === 0) {
      return res.status(404).json({ message: 'No question sets found for this assessment' });
    }

    // Randomly select one question set
    const selectedSet = questionSets[Math.floor(Math.random() * questionSets.length)];

    // Store the assessment assignment in PostgreSQL
    const newAssignment = await db.assessmentAssignment.create({
      assessmentId,
      setObjectId: selectedSet._id.toString(),
      qadatasetName: selectedSet.qadatasetName,
      username
    });

    res.status(200).json(selectedSet.qaDataset);
  } catch (error) {
    console.error('Error starting assessment:', error);
    res.status(500).json({ message: 'Error starting assessment', error: error.message });
  }
};

const submitAssessment = async (req, res) => {
  const submissionData = req.body;

  try {
    const assessmentId = submissionData.assessmentId;
    const assignment = await db.assessmentAssignment.findOne({
      attributes:['id','setObjectId'],
      where:{
        assessmentId : {
          [Op.eq] : assessmentId,
        },
        username : {
          [Op.eq] : submissionData.userName
        }
      }
    });

    const assessment = await db.assessment.findOne({
      attributes:['title', 'passingCriteria'],
      where:{
        id : {
          [Op.eq] : assessmentId,
        },
      }
    });
  
    const qadatasetId = assignment.setObjectId;

    const descriptiveQuestions = submissionData.qaDataset.filter(rec=>rec.questionType!=='multi'&&rec.questionType!=='single');
   

      const evaluationResult = await evaluateAssessment(submissionData.qaDataset, qadatasetId);
      submissionData.qaDataset = evaluationResult.submissionData;

    if(descriptiveQuestions.length>0){
      submissionData.markForEvaluation = true;
    } else {
      submissionData.markForEvaluation = false;
      submissionData.score = evaluationResult.marks;

      const assessmentReport = createAssessmentReport(submissionData.assessmentName,assessment.passingCriteria,assignment.id,evaluationResult.marks,submissionData.userName,submissionData.feedback);
      if(!assessmentReport) {
        res.status(500).json({ message: 'Failed to create assessment report' });
      }
    }
    const result = await db.mongoDB.collection('AssessmentSubmission').insertOne(submissionData);
    if (result.acknowledged) {
      assignment.set('status','Completed');
      await assignment.save();
      res.status(200).json({ message: 'Assessment submitted successfully', insertedId: result.insertedId });
    } else {
      console.error('Failed to insert document:', result);
      res.status(500).json({ message: 'Failed to submit assessment' });
    }
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ message: 'Error submitting assessment', error: error.message });
  }
};

/**
 * To Be Tweaked based on the chnages in the models when the other 
 * major functionalities are done.
 * @param {*} req 
 * @param {*} res 
 */
const traineeDashboard = async (req,res) => {
  const traineeName = req.user.username;

  //Trainee association with Assessment Assignment has been changed. The following queries need to be tweaked 
  //as per the changes.
  try{
    let trainingProgress = await db.sequelize.query(`SELECT training_assignments.training_program_name, training_programs.status AS training_program_status, 
      (COUNT(CASE WHEN subtopics.status = 'Completed' THEN 1 END) * 100.0 / COUNT(subtopics.subtopic_id)) AS progress_percentage
    FROM trainees 
    INNER JOIN batches 
    ON batches.id = trainees."batchId"
    INNER JOIN training_assignments
    ON batches.id = ANY(training_assignments.batch_ids)
    INNER JOIN training_programs
    ON training_programs.trainingprogram_id = training_assignments.trainingprogram_id
    INNER JOIN subtopics
    ON subtopics.subtopic_id = training_assignments.subtopic_id
    WHERE trainees.name = '${traineeName}'
    GROUP BY training_assignments.training_program_name, training_programs.status`);
    
    trainingProgress = trainingProgress?trainingProgress[0]:trainingProgress;
    console.log(trainingProgress);

    let pendingAssessments = await db.sequelize.query(`SELECT "Assessments"."title", "Assessments"."due_date", "AssessmentAssignments"."status", "Assessment Reports"."marks",
      "Assessment Reports"."totalMarks","Assessment Reports"."pass" FROM trainees
      INNER JOIN batches ON batches.id = trainees."batchId"
      INNER JOIN training_assignments ON batches.id = ANY(training_assignments.batch_ids)
      INNER JOIN training_programs ON training_programs.trainingprogram_id = training_assignments.trainingprogram_id
      INNER JOIN "Assessments" ON "Assessments"."trainingProgramId" = training_programs.trainingprogram_id
      INNER JOIN "AssessmentAssignments" ON "AssessmentAssignments"."assessmentId" = "Assessments".id
      LEFT OUTER JOIN "Assessment Reports" ON "Assessment Reports"."assignmentId" = "AssessmentAssignments".id
      WHERE trainees.name='${traineeName}'
      GROUP BY "Assessments"."title", "Assessments"."due_date", "AssessmentAssignments"."status", "Assessment Reports"."marks",
      "Assessment Reports"."totalMarks","Assessment Reports"."pass"`)

      console.log(pendingAssessments);
      pendingAssessments = pendingAssessments?pendingAssessments[0]:pendingAssessments

res.status(200).json({trainingProgress:trainingProgress,
pendingAssessments:pendingAssessments
});
      
  } catch(error) {
    console.log(error);
    res.status(500)
  }

// const progressSequelize = await Trainee.findAll({
//   attributes: [
//     // 'training_program_name',
//     // [col('assignments.training_programs.status'), 'training_program_status']
//     [literal(`(COUNT(CASE WHEN subtopic.status = 'Completed' THEN 1 END) * 100.0 / COUNT(subtopic.subtopic_id))`), 'progress_percentage']
//   ],
//   include: [
//     {
//       model: Batch,
//       as: 'batchDetails',
//       required: true,
//       include: [
//         {
//           model: TrainingAssignment,
//           as: 'assignments',
//           attributes:['training_program_name'],
//           required: true,
//           where: {
//             batch_ids: {
//               [Op.contains]: [1]
//             }
//           },
//           include: [
//             {
//               model: TrainingProgram,
//               as: 'training_programs',
//               attributes: [[col('status'), 'training_program_status']],
//               required: true
//             },
//             {
//               model: Subtopic,
//               as: 'subtopic',
//               required: true
//             }
//           ]
//         }
//       ]
//     }
//   ],
//   where: {
//     name: 'Guna'
//   },
//   group: [
//     // 'assignments.training_program_name',
//     // 'assignments.training_programs.status',
//   ]
// });

// console.log(progressSequelize);

// const assessmentReport = await Trainee.findAll({
//   attributes:[],
//   include:[{
//     model: Batch,
//     as:'batchDetails',
//     required:true,
//     attributes:[],
//     include:[{
//       model: TrainingAssignment,
//       as:'assignments',
//       required: true,
//       attributes: [],
//       include:[{
//         model: TrainingProgram,
//         as: 'training_programs',
//         required: true,
//         attributes:[],
//         include:[{
//           model:db.assessment,
//           as:'assessments',
//           attributes:['title','due_date'],
//           include:[{
//             model:db.assessmentAssignment,
//             where:{
//               username:traineeName
//             },
//             as:'assessment_assignments',
//             attributes:['status'],
//             include:[{
//               model: db.assessmentReports,
//               as:'assessment_reports',
//               attributes:['marks','totalMarks','pass'],
//             }]
//           }]
//         }]
//       }]
//     }]
//   }],
//   where:{
//     name:traineeName,
//   }
// });

}

const evaluateAssessment = async (qaDetailsFromAssessment, qadatasetId) => {
  let marks = 0;

  try{
    const qaDataSet = await db.mongoDB.collection('QuestionSetDetails').findOne(new ObjectId(qadatasetId.replace(/"/g, '')));
    if(!qaDataSet) {
      res.status(404).json({message: 'cannot find the related dataset for the assessment.'});
    }

    const qaDetailsFromDataSet = qaDataSet.qaDataset;

    let questionCount = qaDetailsFromAssessment.length;
    for(i=0;i<questionCount;i++){
      const question = qaDetailsFromAssessment[i];
      if(question.questionType!=='multi'&&question.questionType!=='single') {
        // marks+=1;
        continue;
      }
      let questionFromDataSet = qaDetailsFromDataSet.filter(rec=>rec.question===question.question&&rec.questionType===question.questionType);
      if(questionFromDataSet) questionFromDataSet = questionFromDataSet[0];
      let answer = questionFromDataSet.answer;
      
      let answerByUser = question.options.filter(rec=>rec.isSelected);

      if(answerByUser.length===answer.length&&answerByUser.every(ans=>answer.includes(ans.option))) {
        marks+=1;
        question.isApproved = true;
      } else question.isApproved = false;
      // qaDetailsFromAssessment[i].question=question;
    }
    marks = ((marks/questionCount)*100).toFixed(2);
  } catch (error) {
    console.log(error);
  }

  return {marks:Math.floor(marks),submissionData:qaDetailsFromAssessment};
}

const createAssessmentReport = async(assessmentName, passingCriteria, assignmentId, marks, userName, feedback) => {
  let assessmentReport = null;
  try{
    assessmentReport = await db.assessmentReports.create({
    assessmentName,
    assignmentId,
    marks,
    traineeName: userName,
    totalMarks: 100,
    pass: marks>=passingCriteria,
    feedback: feedback,
  });
} catch(error) {
  console.log(error);
  return assessmentReport;
}
return assessmentReport;
}

/**
 * Api to get the Assessment Report Details
 * @param {*} req 
 * @param {*} res 
 */
const getConsolidatedReport = async (req,res) => {
  const {modelName,username} = req.user;
  const {assessmentId} = req.query;
  try {
    let assessmentReport = await db.assessmentReports.findOne({
      include:[{
        model:db.assessmentAssignment,
        as:'assignment_reports',
        attributes:['assessmentId', 'setObjectId'],
        where:{
          assessmentId:assessmentId,
        }
      }]
    });
    if(!assessmentReport||assessmentReport?.length<=0) {
      return res.status(204).json();
    }

    const assessmentSubmission = await db.mongoDB.collection("AssessmentSubmission");
    const questionSets = await db.mongoDB.collection("QuestionSetDetails");
    const answers = await assessmentSubmission.findOne({
      assessmentId,
      userName:username
    });
    if(!answers) return res.status(404).json({error:'Cannot find the Assessment Submission.'});

    const questions = await questionSets.findOne({
      _id : ObjectId.createFromHexString(assessmentReport?.assignment_reports?.setObjectId)
    });
    if(!questions) return res.status(404).json({error:'Cannot find the Assessment QuestionSet.'});
    let answerKey = [];
    for(let i=0; i<questions.qaDataset.length; i++){
      const question = questions.qaDataset[i];
      const answer = answers.qaDataset[i];
      answerKey.push({
        question:question.question,
        questionType:question.questionType,
        options:question.options,
        isApproved:answer.isApproved,
        answer:question.questionType==='code'?answer.answer.code:question.questionType==='descriptive'?answer.answer.answer:
        answer.answer,
        actualAnswer:question.questionType==='code'||question.questionType==='descriptive'?question.answer:
        question.questionType==='single'||question.questionType==='multi'?question.options.map(option=>option.isSelected).join(','):'',
      })
    }

    assessmentReport = assessmentReport.toJSON();

    const consolidatedReport = {...assessmentReport,answerKey};
    return res.status(200).json(consolidatedReport);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  submitFeedback,
  submitAssessmentReport,
  getAssessmentReport,
  getDataset,
  getAssessmentById,
  getAssessmentDetails,
  startAssessment,
  submitAssessment,
  traineeDashboard,
  evaluateAssessment,
  createAssessmentReport,
  getAssessmentByTrainingProgramID,
  getConsolidatedReport
};
