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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
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
    
    // Check if the response was successful but returned no messages
    if (response.data.success && Array.isArray(response.data.conversation)) {
      return response.data.conversation;
    }
    
    // If no messages, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    // Return empty array instead of throwing error
    return [];
  }
}
,

async sendMessage(payload) {
  try {
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    console.log('Sending message with auth:', {
      userRole,
      hasToken: !!token,
      payload: {
        ...payload,
        sender_role: userRole
      }
    });

    const response = await axiosInstance.post('/api/messages', {
      ...payload,
      sender_role: userRole
    });

    console.log('Message response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al enviar el mensaje');
    }

    return response.data;
  } catch (error) {
    console.error('Error in sendMessage:', error.response?.data || error);
    if (error.response?.status === 403) {
      throw new Error(error.response.data.error || 'No tiene permisos para enviar mensajes');
    }
    throw new Error(error.response?.data?.error || 'Error al enviar el mensaje');
  }
},

async sendConversationMessage(payload) {
  try {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      throw new Error('No se encontró el rol del usuario');
    }

    const response = await axiosInstance.post('/api/messages/conversation', {
      subject: payload.subject,
      content: payload.content,
      sender_role: userRole
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al enviar el mensaje');
    }
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('No tiene permisos para enviar mensajes');
    }
    console.error('Error sending conversation message:', error);
    throw new Error(error.response?.data?.error || 'Error al enviar el mensaje en la conversación');
  }
},

  async searchUsers(query) {
    try {
      const response = await axiosInstance.get('/api/messages/search-users', {
        params: { query }
      });
      return response.data.users || [];
    } catch (error) {
      console.error('Error searching users:', error);
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

export default messageService;