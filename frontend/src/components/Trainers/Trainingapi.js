import api from '../../utils/api';

const API_BASE_URL = 'http://localhost:5000/api/coordinator'; // Adjust the base URL as needed

export const getTrainingPrograms = () => api.get(`${API_BASE_URL}/training-programs`);
export const getTrainingProgramById = (id) => api.get(`${API_BASE_URL}/training-program/${id}`);
export const createTrainingProgram = (data) => api.post(`${API_BASE_URL}/training-program`, data);
export const updateTrainingProgram = (id, data) => api.put(`${API_BASE_URL}/training-program/${id}`, data);
export const deleteTrainingProgram = (id) => api.delete(`${API_BASE_URL}/training-program/${id}`);

export const updateSubtopic = async (subtopicId, subtopicData) => {
    return await api.put(`${API_BASE_URL}/subtopics/${subtopicId}`, subtopicData);
};