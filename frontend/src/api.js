import api from '../src/utils/api';

const API_URL = 'http://localhost:5000/api'; // Adjust the URL based on your backend server

export const getTrainingTopics = async () => {
  try {
    console.log("Checking all the training topics");
    const response = await api.get(`${API_URL}/training-topics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching training topics:', error);
    throw error;
  }
};

export const createTrainingTopic = async (data) => {
  try {
    const response = await api.post(`${API_URL}/training-topics`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating training topic:', error);
    throw error;
  }
};

export const updateTrainingTopic = async (id, data) => {
  try {
    const response = await api.put(`${API_URL}/training-topics/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating training topic:', error);
    throw error;
  }
};

export const deleteTrainingTopic = async (id) => {
  try {
    await api.delete(`${API_URL}/training-topics/${id}`);
  } catch (error) {
    console.error('Error deleting training topic:', error);
    throw error;
  }
};