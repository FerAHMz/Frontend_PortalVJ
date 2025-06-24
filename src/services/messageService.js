import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const messageService = {
  async getConversations() {
    try {
      const response = await axiosInstance.get('/api/messages');
      return response.data.conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  async getConversationMessages(subject) {
    try {
      const response = await axiosInstance.get('/api/messages/conversation', {
        params: { subject }
      });
      return response.data.conversation;
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  },

  async searchUsers(query) {
    try {
      const response = await axiosInstance.get('/api/messages/search-users', {
        params: { query }
      });
      return response.data.users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  async sendMessage(messageData) {
    try {
      const response = await axiosInstance.post('/api/messages', messageData);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        console.error('Network error:', error);
        throw new Error('No se pudo conectar con el servidor. Por favor, revise su conexión a internet.');
      }
      console.error('Error sending message:', error);
      throw new Error(error.response?.data?.error || 'Error al enviar el mensaje');
    }
  },

  async sendConversationMessage(messageData) {
    try {
      const response = await axiosInstance.post('/api/messages/conversation', messageData);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        console.error('Network error:', error);
        throw new Error('No se pudo conectar con el servidor. Por favor, revise su conexión a internet.');
      }
      console.error('Error sending conversation message:', error);
      throw new Error(error.response?.data?.error || 'Error al enviar el mensaje en la conversación');
    }
  },

  async sendMessage(recipientId, recipientRole, subject, content) {
    try {
      const response = await axiosInstance.post('/api/messages', {
        recipient_id: recipientId,
        recipient_role: recipientRole,
        subject,
        content
      });
      return response.data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async markAsRead(messageId) {
    try {
      const response = await axiosInstance.patch(`/api/messages/${messageId}/read`);
      return response.data.message;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
};
