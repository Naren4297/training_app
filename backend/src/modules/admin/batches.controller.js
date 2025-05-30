const { Batch } = require('./models/batches.model');
const { Trainee } = require('./models/trainee.model');
const { Op } = require('sequelize');

// Fetch all batches
exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.findAll({
      include: [{ model: Trainee, as: 'batchTrainees' }],
    });
    res.status(200).json(batches);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
};

// Create a new batch and trainees
exports.createBatch = async (req, res) => {
  const {username} = req.user
  const { batch_name, joined_date, trainees } = req.body;

  try {
    // Check if batch name already exists
    const existingBatch = await Batch.findOne({ where: { name: batch_name } });
    if (existingBatch) {
      return res.status(400).json({ error: 'Batch name already exists' });
    }

    const validRoles = ['trainee', 'Trainee', 'TRAINEE'];
    const existingEmployeeIDs = new Set((await Trainee.findAll({ attributes: ['employeeID'], raw: true })).map(t => t.employeeID));

    const validTrainees = [];
    const invalidTrainees = [];
    
    trainees.forEach(trainee => {
      if ((validRoles.includes(trainee.role) || trainee.role === undefined) && !existingEmployeeIDs.has(trainee.employeeID)) {
        validTrainees.push({
          employeeID: trainee.employeeID,
          name: trainee.name,
          email: trainee.email,
          password: trainee.password,
          role: 'trainee',
          batchName: batch_name,
          joining_date: joined_date,
          createdBy:username,
          modifiedBy:username,
        });
        existingEmployeeIDs.add(trainee.employeeID);
      } else {
        invalidTrainees.push(trainee.employeeID);
      }
    });

    if (validTrainees.length === 0) {
      return res.status(400).json({ error: 'No valid trainees to create the batch', invalidTrainees });
    }

    const newBatch = await Batch.create({
      name: batch_name,
      joined_date,
      traineesCount: validTrainees.length,
      createdBy:username
    });

    // Assign the batchId to each valid trainee
    validTrainees.forEach(trainee => {
      trainee.batchId = newBatch.id;
    });

    console.log(validTrainees);
    await Trainee.bulkCreate(validTrainees);

    res.status(201).json({ batch: newBatch, invalidTrainees });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create batch' });
  }
};

exports.editBatch = async (req, res) => {
  const{username} = req.user
  const { id, batch_name, joined_date, trainees } = req.body;

  try {
    const batch = await Batch.findByPk(id);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Check if batch name already exists
    const existingBatch = await Batch.findOne({ where: { name: batch_name, id: { [Op.ne]: id } } });
    if (existingBatch) {
      return res.status(400).json({ error: 'Batch name already exists' });
    }

    batch.name = batch_name;
    batch.joined_date = joined_date;
    batch.traineesCount = trainees.length;
    await batch.save();

    const validRoles = ['trainee', 'Trainee', 'TRAINEE'];
    const existingEmployeeIDs = new Set((await Trainee.findAll({ attributes: ['employeeID'], where: { batchId: id }, raw: true })).map(t => t.employeeID));

    const validTrainees = [];
    const invalidTrainees = [];

    for (const trainee of trainees) {
      if (!existingEmployeeIDs.has(trainee.employeeID)) {
        const existingTrainee = await Trainee.findOne({ where: { employeeID: trainee.employeeID, batchId: id } });

        if (existingTrainee) {
          // Update existing trainee
          existingTrainee.name = trainee.name;
          existingTrainee.email = trainee.email;
          existingTrainee.password = trainee.password;
          existingTrainee.role = 'trainee';
          existingTrainee.batchName = batch_name;
          existingTrainee.joining_date = joined_date;
          await existingTrainee.save();
        } else {
          // Create new trainee
          validTrainees.push({
            employeeID: trainee.employeeID,
            name: trainee.name,
            email: trainee.email,
            password: trainee.password,
            role: 'trainee',
            batchId: id,
            batchName: batch_name,
            joining_date: joined_date,
            modifiedBy:username,
          });
        }
      } else {
        invalidTrainees.push(trainee.employeeID);
      }
    }

    // Remove trainees that are no longer in the list using employeeID
    const currentTrainees = await Trainee.findAll({ where: { batchId: id } });
    const currentEmployeeIDs = new Set(currentTrainees.map(t => t.employeeID));
    const newEmployeeIDs = new Set(trainees.map(t => t.employeeID));
    const traineesToRemove = currentTrainees.filter(t => !newEmployeeIDs.has(t.employeeID));
    await Trainee.destroy({ where: { employeeID: traineesToRemove.map(t => t.employeeID) } });

    if (validTrainees.length > 0) {
      await Trainee.bulkCreate(validTrainees);
    }

    if (invalidTrainees.length > 0) {
      return res.status(200).json({ batch, message: `These employee IDs have unexpected roles or are duplicates: ${invalidTrainees.join(', ')}` });
    }

    res.status(200).json({ batch });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update batch' });
  }
};

// Delete a batch and its trainees
exports.deleteBatch = async (req, res) => {
  const { id } = req.query;

  try {
    const batch = await Batch.findByPk(id);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    await Trainee.destroy({ where: { batchId: id } });
    await batch.destroy();

    res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete batch' });
  }
};