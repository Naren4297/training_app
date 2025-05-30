import api from './api'
const sendNotification = async (userId, message) => {
    try {
      const response = await api.post('/notification/send-notification', { userId, message });
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };
  
export default sendNotification;