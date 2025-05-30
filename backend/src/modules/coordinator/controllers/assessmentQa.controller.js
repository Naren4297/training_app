const { Json } = require('sequelize/lib/utils');
const db = require('../../../config/db.config'); 
const Assessment = db.assessment; 
const AssessmentAssignment = db.assessmentAssignment;
const {Batch} = require('../../admin/models/batches.model');
const {Trainee} = require('../../admin/models/trainee.model');
const { Op, where, col } = require('sequelize');
const { TrainingProgram } = require('../models/trainingprogram.model');
const { TrainingAssignment } = require('../models/trainingassignment.model');
const { model } = require('mongoose');
const QA = db.qaInfo;

const createAssessment = async (req, res) => { 
  const { title, description, due_date, duration, createdBy, updatedBy, customize, shuffle, dataset, trainer, passingCriteria, assignToBatch, questionSetsCount, topics,trainingProgramId } = req.body; 
  const{assignToTrainee}=req.body;
  
  const assignToUser = assignToTrainee;

  try { 
    const whereClause = {
      title,
      ...(assignToBatch && { assignToBatch }),
      ...(assignToUser && { assignToUser })
    };
    
    const existingAssessment = await Assessment.findOne({
      where: whereClause
    });

    if (existingAssessment) {
      return res.status(400).json({ message: 'An assessment with the same title and assignee already exists' });
    }

    // Query the QuestionAnswers table to get the dataset value
    const questionAnswersCollection = db.mongoDB.collection('QuestionAnswers');
    const datasetValue = await questionAnswersCollection.findOne({ datasetName: dataset });

    if (!datasetValue) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    const collection = db.mongoDB.collection('QuestionSetDetails');

    // Function to create a customized dataset
    const createCustomizedDataset = () => {
      let customizedQuestions = datasetValue.questions;

      if (customize) {
        customizedQuestions = customizedQuestions.filter(question => {
          const matchesTopic = Object.entries(topics).some(([topicKey, topicArray]) => 
            Array.isArray(topicArray) && topicArray.some(topic => 
              topic.type && question.questionTopics && question.questionTopics.includes(topicKey)
            )
          );
          return matchesTopic;
        });

        if (shuffle) {
          customizedQuestions = customizedQuestions.sort(() => Math.random() - 0.5);
        }
      }

      return customizedQuestions;
    };
    const assignTo = assignToBatch ? assignToBatch : assignToUser;

    // Create and save multiple datasets
    const insertedIds = [];
    const idToNameMap = new Map();

    for (let i = 1; i <= questionSetsCount; i++) {
      let customizedQuestions = createCustomizedDataset();
      let document = {
        assessmentName: title,
        qadatasetName: `${dataset}_Set${i}`,
        datasetName:dataset,
        assignedTo: assignTo,
        qaDataset: customizedQuestions,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(document);
      insertedIds.push(result.insertedId.tohe);
      idToNameMap.set(JSON.stringify(result.insertedId).replace(/"/g,''),`${dataset}_Set${i}`);
    }

    const assessment = await Assessment.create({
      title,
      description,
      due_date,
      duration,
      createdBy,
      updatedBy,
      customize,
      shuffle,
      assignToBatch: JSON.stringify(assignToBatch),
      assignToUser: JSON.stringify(assignToUser),
      dataset,
      questionSetsCount,
      passingCriteria,
      trainer: JSON.stringify(trainer),
      topics: JSON.stringify(topics),
      questionSetID: JSON.stringify(insertedIds),
      trainingProgramId:trainingProgramId
    }); 

    await createAssessmentAssignment(assessment,idToNameMap);
    res.status(201).json({ message: 'Assessment, Assignments and QA details saved successfully', insertedIds }); 
  } catch (error) { 
    console.log(error)
    res.status(500).json({ message: 'Error saving data', error }); 
  } 
};

const getTraineesFromBatches = async (batchesToAssign) => {
  let traineeNames = [];
  if(typeof(batchesToAssign)!=="object") return null;

  await Batch.findAll({
    attributes:['id'],
    where:{
      name: {
        [Op.in]:batchesToAssign,
      }
    },
    include: [{
      model : Trainee,
      attributes : ['name'],
      as: 'batchTrainees',
    }],  
    // order: [[{ model: Trainee, as: 'batchTrainees' },'name','ASC']],
    group: ['batchTrainees.name','Batch.id','batchTrainees.id'],
  }).then(result => {
    result.forEach(item => {
      item.toJSON().batchTrainees.forEach(({ name }) => traineeNames.push(name))
    });
  }).catch(error => {
    console.log(error);
  });
  return traineeNames;
}

const getTrainees = async(traineesToAssign) => {
  let traineeNames = [];

  if(typeof(traineesToAssign)!=='object') return null;
  await Trainee.findAll({
    attributes:['name'],
    where:{
      name:{
        [Op.in]: traineesToAssign,
      }
    },
    // order: [['name','ASC']],
    group: ['Trainee.name'],
  }).then(result => {
    traineeNames = result.map(item => item.toJSON().name);
  }).catch(error => {
    console.log(error);
  });

  return traineeNames;
}

const chooseDataSet = (assessmentId,idToNameMap,traineeNames) => {
  let keys = Array.from(idToNameMap.keys());
  keys = keys.sort(() => Math.random() - 0.5);

  const assignmentFields = [];
  traineeNames.map((trainee,index) => (
    assignmentFields.push({
      assessmentId:assessmentId,
      username:trainee,
      qadatasetName:idToNameMap.get(keys[index%keys.length]),
      setObjectId: keys[index%keys.length],
    })
));
return assignmentFields;
}

const updateDataSet = (idToNameMap, count) => {
  let keys = Array.from(idToNameMap.keys());
  keys = keys.sort(() => Math.random() - 0.5);

  const assignmentFields = [];
  for(i=0;i<count;i++){
    assignmentFields.push({
      qadatasetName:idToNameMap.get(keys[i%keys.length]),
      setObjectId: keys[i%keys.length],
    });
  }
return assignmentFields;
}

const createAssessmentAssignment = async(assessment,idToNameMap) => {  
  let batchesToAssign = assessment.assignToBatch;
  batchesToAssign = JSON.parse(batchesToAssign);

  let traineesToAssign = assessment.assignToUser;
  traineesToAssign = JSON.parse(traineesToAssign);
  
  let traineeNames = [];

  if(batchesToAssign){
    traineeNames = await getTraineesFromBatches(batchesToAssign);
  } else {
    traineeNames = await getTrainees(traineesToAssign);
  }

  const assignmentFields = chooseDataSet(assessment.id,idToNameMap,traineeNames);

  try {
    await AssessmentAssignment.bulkCreate(assignmentFields);
  } catch (error) {
    console.log(error);
  }
  }
   

const updateAssessmentAndQA = async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, duration, createdBy, updatedBy, customize, shuffle, dataset, trainer, passingCriteria, assignToBatch, questionSetsCount, topics, trainingProgramId } = req.body;
  const {assignToTrainee} = req.body;

  let assignToUser = assignToTrainee;

  try {
    // Query the QuestionAnswers table to get the dataset value
    const questionAnswersCollection = db.mongoDB.collection('QuestionAnswers');
    const datasetValue = await questionAnswersCollection.findOne({ datasetName: dataset });

    if (!datasetValue) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    const collection = db.mongoDB.collection('QuestionSetDetails');

    //Function to update Assessment Assignments
    const updateAssignments = async (assessment, updatedAssessment, idToNameMap) => {
      const assignments = await AssessmentAssignment.findAll({
        where:{
          assessmentId:{
            [Op.eq]:assessment.id,
          }
        }
      });

      if(!assignments) createAssessmentAssignment(updatedAssessment,idToNameMap);
      const prevAssignment = assessment.assignToBatch?'assignToBatch':assessment.assignToUser?'assignToUser':null;
      const currAssignment = assessment.assignToBatch?'assignToBatch':assessment.assignToUser?'assignToUser':null;
      
      if(prevAssignment===currAssignment){
        const prevAssignees = assessment[prevAssignment];
        const currrentAssignees = updatedAssessment[prevAssignment];

        if(prevAssignees&&currrentAssignees&&prevAssignees!==currrentAssignees) {
          prevAssignees = JSON.parse(prevAssignees);
          currrentAssignees = JSON.parse(currrentAssignees);

          let newAssignees = [];
          currrentAssignees.forEach(assignee=>{
            if(prevAssignees.includes(assignee)){
              prevAssignees.splice(prevAssignees.indexOf(assignee),1);
            } else {
              newAssignees.push(assignee);
            }
          });

          if(!prevAssignees) {
          let traineeNames = [];
          if(prevAssignment==='assignToBatch') traineeNames = getTraineesFromBatches(prevAssignees);
          else traineeNames = getTrainees(prevAssignees);
          
          const existingAssignments = [];
          assignments.forEach(async (rec)=>{
            if(traineeNames.includes(rec.userName)) await rec.destroy();
            else existingAssignments.push(rec);
          });
          }
        
          if(newAssignees){
            let traineeNames = [];
            if(prevAssignment==='assignToBatch') traineeNames = await getTraineesFromBatches(prevAssignees);
            else traineeNames = await getTrainees(prevAssignees);

            const assignmentFields = chooseDataSet(updatedAssessment.id,idToNameMap,traineeNames);
            try {
              await AssessmentAssignment.bulkCreate(assignmentFields);
            } catch (error) {
              console.log(error);
            }
          }
          if(existingAssignments) {
            const assignmentFields = updateDataSet(idToNameMap,existingAssignments.length);
            existingAssignments.forEach((rec,index)=>{
            rec.update(assignmentFields[index]);
            });
          }
        } else {
          const assignmentFields = updateDataSet(idToNameMap,assignments.length);
          assignments.forEach((rec,index)=>{
          rec.update(assignmentFields[index]);
          });
        }
      } else{
        assignments.forEach(async (rec) => {
          await rec.destroy();
        });

        createAssessmentAssignment(updatedAssessment, idToNameMap);
      }
    }

    // Function to create a customized dataset
    const createCustomizedDataset = (topics) => {
      let customizedQuestions = datasetValue.questions;

      if (customize) {
        const topicCounts = typeof topics === 'string' ? JSON.parse(topics) : topics;
        customizedQuestions = customizedQuestions.filter(question => {
          const questionTopics = question.questionTopics || [];
          for (const topic of questionTopics) {
            if (topicCounts[topic]) {
              const topicInfo = topicCounts[topic].find(info => info.type === question.questionType);
              if (topicInfo && topicInfo.count > 0) {
                topicInfo.count--;
                return true;
              }
            }
          }
          return false;
        });

        if (shuffle) {
          customizedQuestions = customizedQuestions.sort(() => Math.random() - 0.5);
        }
      }

      return customizedQuestions;
    };

    const assignTo = assignToBatch ? assignToBatch : assignToUser;

    const idToNameMap = new Map();
    // Create multiple datasets
    for (let i = 1; i <= questionSetsCount; i++) {
      let customizedQuestions = createCustomizedDataset(topics);
      let document = {
        assessmentName: title,
        assessmentId: id,
        qadatasetName: `${dataset}_Set${i}`,
        assignedTo: assignTo,
        qaDataset: customizedQuestions,
        updatedAt: new Date()
      };

      const result = await collection.updateOne(
        { assessmentId: id, qadatasetName: `${dataset}_Set${i}` },
        { $set: document },
        { upsert: true }
      );

      if (result.matchedCount > 0 && result.modifiedCount > 0) {
        // Retrieve the updated document to get its _id
        const updatedDocument = await collection.findOne({assessmentId: id, qadatasetName: `${dataset}_Set${i}` });
        idToNameMap.set(JSON.stringify(updatedDocument._id).replace(/"/g,''),`${dataset}_Set${i}`);
      } 
    }

    // Update the assessment
    const assessment = await Assessment.findByPk(id);
    const assessmentJson = assessment.toJSON();
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    const updatedAssessment = await assessment.update({
      title,
      description,
      due_date,
      duration,
      createdBy,
      updatedBy,
      customize,
      shuffle,
      assignToBatch: JSON.stringify(assignToBatch),
      assignToUser: JSON.stringify(assignToUser),
      dataset,
      questionSetsCount,
      passingCriteria,
      trainer: JSON.stringify(trainer),
      topics: JSON.stringify(topics),
      trainingProgramId:trainingProgramId
    });
    const updatedAssessmentJson = updatedAssessment.toJSON();

    await updateAssignments(assessmentJson,updatedAssessmentJson,idToNameMap);

    res.status(200).json({ message: 'Assessment and QA details updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error updating data', error });
  }
};

const getAssessmentsByAssignment = async (req, res) => {
  const { assignToBatch, assignToUser } = req.query;
  let {modelName,username} = req.user;

  try {
    const whereClause = {};
    if (assignToBatch) {
      whereClause.assignToBatch = JSON.stringify([assignToBatch]);
    }
    if (assignToUser) {
      whereClause.assignToUser = JSON.stringify([assignToUser]);
    }

    const assessments = await Assessment.findAll({
      attributes: ['id', 'title'],
      where: {
        [Op.or]: [
          whereClause.assignToBatch ? { assignToBatch: whereClause.assignToBatch } : null,
          whereClause.assignToUser ? { assignToUser: whereClause.assignToUser } : null
        ].filter(Boolean)
      }
    });

    res.status(200).json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'An error occurred while fetching assessments' });
  }
};

// Get all Assessments and QA
const getAssessmentAndQA = async (req, res) => {
  try {
    const assessments = await Assessment.findAll({
      include: [{
        model: QA,
        as: 'qaInfo'
      }]
    });

    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving data', error });
  }
};

const getAssessmentDetails = async (req, res) => {
  let {modelName,username} = req.user;
  modelName = modelName?.toLowerCase();
  console.log(req.user);
  const include = modelName === 'trainee' ? [{
    model:db.assessmentAssignment,
    as:'assessment_assignments',
    where:{
      [Op.and] :[
        {username:username},
        {status:'Completed'},
      ]
    }
  }] : [{
    model:TrainingProgram,
    as:'assessments',
    attributes:['title'],
    where: (modelName === 'coordinator' || modelName === 'admin') ? {
      created_by:username,
    }:{},
    include: modelName === 'trainer' ? [{
      model:TrainingAssignment,
      as:'assignments',
      attributes:[],
      where: {
        trainer_name:username,
      }
    }]: [],
  }];

  try {
    const assessments = await Assessment.findAll({
      attributes: ['id','title','description' ,'duration', 'due_date', 'createdBy', 'createdAt'],
      include:include,
    });

    console.log(assessments);
    res.status(200).json(assessments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error retrieving data', error });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findOne({
      where: { id }
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.status(200).json(assessment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error retrieving data', error });
  }
};



// Delete Assessment and QA
const deleteAssessment = async (req, res) => {
  const { id } = req.params;

  try {
    const assessment = await Assessment.findByPk(id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Delete associated QA entries
    await QA.destroy({ where: { assessmentId: id } });

    // Delete the assessment
    await assessment.destroy();

    res.status(200).json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting data', error });
  }
};

const fetchAssessmentSubmissions = async (req, res) => {
  const { userName, assessmentId, assessmentName } = req.query;

  try {
    const collection = await db.mongoDB.collection("AssessmentSubmission");
    const results = await collection.find({
      userName,
      assessmentId: parseInt(assessmentId, 10),
      assessmentName
    }).toArray();

    res.status(200).send(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assessment submissions', error });
  }
};
module.exports = { 
  createAssessment,
  getAssessmentAndQA,
  getAssessmentDetails,
  updateAssessmentAndQA,
  deleteAssessment,
  getAssessmentById,
  getAssessmentsByAssignment,
  fetchAssessmentSubmissions
};