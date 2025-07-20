import axios from 'axios';

const API_URL = 'http://localhost:3000/api/superusers';

export const userService = {
    async getAllUsers() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await axios.get(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 500) {
                throw new Error('Error en el servidor: ' + error.response.data.error);
            }
            throw error;
        }
    },

    async createUser(userData) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await axios.post(API_URL, userData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 500) {
                throw new Error('Error en el servidor: ' + (error.response.data.error || 'Error desconocido'));
            } else if (error.response?.status === 400) {
                throw new Error('Error en los datos: ' + (error.response.data.error || 'Datos inválidos'));
            }
            throw error;
        }
    },

    async updateUser(id, userData) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await axios.put(`${API_URL}/${id}`, userData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                throw new Error('No tiene permisos para realizar esta acción');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data.error || 'Datos inválidos');
            } else if (error.response?.status === 500) {
                throw new Error('Error en el servidor: ' + (error.response.data.error || 'Error desconocido'));
            }
            throw error;
        }
    },

    async deleteUser(id, rol) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: { rol }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                throw new Error('No tiene permisos para realizar esta acción');
            } else if (error.response?.status === 404) {
                throw new Error('Usuario no encontrado');
            } else if (error.response?.status === 500) {
                throw new Error('Error en el servidor: ' + (error.response.data.error || 'Error desconocido'));
            }
            throw error;
        }
    }
};