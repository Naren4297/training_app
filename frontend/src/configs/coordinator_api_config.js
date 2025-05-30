import api from "../utils/api";

const BASE_URL = "http://localhost:5000/api/coordinator";

export const getTrainingPrograms = async (userName) => {
  try {
    const response = await api.get(`${BASE_URL}/training-programs`,{params:{userName}});
    return response.data; // Assuming the API returns an array of programs
  } catch (error) {
    console.error("Error fetching training programs:", error);
    throw error;
  }
};

export const getTrainingProgramByID = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/training-program/${id}`);
    console.log(response.data) // Updated endpoint
    return response.data; // Assuming the API returns the program data
  } catch (error) {
    console.error("Error fetching training program by ID:", error);
    throw error;
  }
};


export const createTrainingProgram = async (programData) => {
  try {
    const response = await api.post(`${BASE_URL}/training-program`, programData);
    return response.data; // Assuming the API returns the created program
  } catch (error) {
    console.error("Error creating training program:", error);
    throw error;
  }
};

export const updateTrainingProgram = async (id, updatedData) => {
  try {
    const response = await api.put(`${BASE_URL}/training-program/${id}`, updatedData);
    return response.data; // Assuming the API returns the updated program
  } catch (error) {
    console.error("Error updating training program:", error);
    throw error;
  }
};

export const deleteTrainingProgram = async (id) => {
  try {
    await api.delete(`${BASE_URL}/training-program/${id}`);
  } catch (error) {
    console.error("Error deleting training program:", error);
    throw error;
  }
};
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------  Assign Trainers & Trainees for Training Programs -----------------------------------------------------------------------

export const getTrainers = async () => {
  const response = await api.get(`${BASE_URL}/trainers`);
  return response.data;
};

export const getBatches = async () => {
  const response = await api.get(`${BASE_URL}/batches`);
  return response.data;
};


export const saveTrainingAssignment = async (updatedData) => {
  const response = await api.post(`${BASE_URL}/createtrainingassignment`, { updatedData });
  return response;
};

export const getTrainingAssignments = async () => {
  return await api.get(`${BASE_URL}/training-assignments`);
};

export const getTrainingAssignmentByID = async (id) => {
  return await api.get(`${BASE_URL}/training-assignment/${id}`);
};

export const getFormattedTrainingAssignmentDetails = async (id) => {
  return await api.get(`${BASE_URL}/getFormattedTrainingAssignmentDetails/${id}`);
};

export const updateTrainingAssignment = async (id, data) => {
  return await api.put(`${BASE_URL}/training-assignment/${id}`, data);
};

export const deleteTrainingAssignment = async (programId) => {
  return await api.delete(`${BASE_URL}/training-assignment/${programId}`);
};

export const getTrainingAssignmentDetails = async (programId) => {
  
  return await api.get(`${BASE_URL}/training-assignment/details/${programId}`);
};

export const submitTrainingProgress = async (updatedData) => {
  const response = await api.put(`${BASE_URL}/training-program/subtopics/status`, { updatedData });
  return response;
};