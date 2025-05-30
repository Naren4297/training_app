import api from '../../utils/api';

const baseUrl = process.env.REACT_APP_BASE_URL;
const API_BASE_URL = `${baseUrl}api/admin`;

// Fetch all entities (Admins, Coordinators, Trainers)
export const fetchEntities = async (entityType) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${entityType}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error(`Failed to fetch ${entityType}`);
  }
};

// Create a new entity (Admin, Coordinator, Trainer)
export const createEntity = async (entityType, entityData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/${entityType}`, entityData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error(`Failed to create ${entityType}`);
  }
};

// Edit an existing entity (Admin, Coordinator, Trainer)
export const editEntity = async (entityType, entityData) => {
  try {
    const response = await api.put(`${API_BASE_URL}/${entityType}/${entityData.id}`, entityData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error(`Failed to update ${entityType}`);
  }
};

// Delete an entity (Admin, Coordinator, Trainer)
export const deleteEntity = async (entityType, id) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/${entityType}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error(`Failed to delete ${entityType}`);
  }
};