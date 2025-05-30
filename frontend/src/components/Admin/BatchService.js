import api from '../../utils/api';

const baseUrl = process.env.REACT_APP_BASE_URL;
const API_BASE_URL = `${baseUrl}api/admin`;

export const fetchBatches = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/get-batches`);
    console.log("data",response)
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch batches');
  }
};

export const createBatch = async (batchData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/create-batch`, batchData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to create batch');
  }
};

export const editBatch = async (batchData) => {
  try {
    const response = await api.put(`${API_BASE_URL}/edit-batch`, batchData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to update batch');
  }
};

export const deleteBatch = async (id) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/delete-batch`, {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to delete batch');
  }
};