import axios from 'axios';

const API_URL = 'http://localhost:3000/api/payments';

export const manualPaymentService = {
  async addPayment(paymentData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const adaptedData = {
        nombre_padre: paymentData.nombre_padre,
        apellido_padre: paymentData.apellido_padre,
        carnet_estudiante: paymentData.carnet_estudiante,
        mes_solvencia: paymentData.mes_solvencia,
        fecha_pago: paymentData.fecha_pago,
        no_boleta: paymentData.no_boleta,
        id_metodo_pago: paymentData.id_metodo_pago, 
        monto: paymentData.monto
      };

      const response = await axios.post(API_URL, adaptedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  },

  async editPayment(id, paymentData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const adaptedData = {
        nombre_padre: paymentData.nombre_padre,
        apellido_padre: paymentData.apellido_padre,
        carnet_estudiante: paymentData.carnet_estudiante,
        mes_solvencia: paymentData.mes_solvencia,
        fecha_pago: paymentData.fecha_pago,
        no_boleta: paymentData.no_boleta,
        id_metodo_pago: paymentData.id_metodo_pago,
        monto: paymentData.monto
      };

      const response = await axios.put(`${API_URL}/${id}`, adaptedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  },

  async invalidatePayment(id, { razon, usuarioId, tipoUsuario }) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.put(`${API_URL}/invalidate/${id}`, 
        { razon, usuarioId, tipoUsuario }, 
        {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  },

  async getStudentsWithPayments() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.get(`${API_URL}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  },

  handleError(error) {
    if (error.response) {
      if (error.response.status === 400) {
        const errors = error.response.data.errors || [error.response.data.error];
        throw new Error(errors.join('\n'));
      } else if (error.response.status === 401) {
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else if (error.response.status === 403) {
        throw new Error('No tiene permisos para esta acción');
      } else if (error.response.status === 404) {
        throw new Error('Recurso no encontrado');
      } else if (error.response.status === 500) {
        throw new Error('Error del servidor: ' + (error.response.data.error || 'Error interno'));
      }
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw error;
    }
  }
};