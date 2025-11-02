import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/director`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No está autenticado');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export default {
  // Obtener todos los maestros
  async getAllTeachers() {
    try {
      const response = await axios.get(`${API_URL}/teachers`, getAuthHeaders());
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener maestros');
      }
      
      return response.data.teachers;
    } catch (error) {
      console.error('Error en getAllTeachers:', error);
      
      // Si no hay endpoint, usar fallback
      if (error.response?.status === 404) {
        return this.getFallbackTeachers();
      }
      
      throw new Error(
        error.response?.data?.message || error.message || 'Error al obtener maestros'
      );
    }
  },

  // Obtener todos los estudiantes
  async getAllStudents() {
    try {
      const response = await axios.get(`${API_URL}/students`, getAuthHeaders());
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener estudiantes');
      }
      
      return response.data.students;
    } catch (error) {
      console.error('Error en getAllStudents:', error);
      
      // Si no hay endpoint, usar fallback
      if (error.response?.status === 404) {
        return await this.getFallbackStudents();
      }
      
      throw new Error(
        error.response?.data?.message || error.message || 'Error al obtener estudiantes'
      );
    }
  },

  // Obtener todos los padres
  async getAllParents() {
    try {
      const response = await axios.get(`${API_URL}/parents`, getAuthHeaders());
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener padres');
      }
      
      return response.data.parents;
    } catch (error) {
      console.error('Error en getAllParents:', error);
      
      // Si no hay endpoint, usar fallback
      if (error.response?.status === 404) {
        return await this.getFallbackParents();
      }
      
      throw new Error(
        error.response?.data?.message || error.message || 'Error al obtener padres'
      );
    }
  },

  // Obtener todo el personal (maestros, estudiantes y padres)
  async getAllStaff() {
    try {
      const [teachers, students, parents] = await Promise.all([
        this.getAllTeachers(),
        this.getAllStudents(),
        this.getAllParents()
      ]);

      // Combinar y formatear los datos
      const staff = [
        ...teachers.map(teacher => ({
          id: teacher.id,
          nombre: teacher.nombre,
          apellido: teacher.apellido,
          email: teacher.email,
          telefono: teacher.telefono,
          rol: 'maestro',
          activo: teacher.activo
        })),
        ...students.map(student => ({
          id: student.carnet || student.id,
          nombre: student.nombre,
          apellido: student.apellido,
          email: student.email || 'N/A',
          telefono: student.telefono || 'N/A',
          rol: 'estudiante',
          activo: student.estado === 'estudiante_activo' || student.activo
        })),
        ...parents.map(parent => ({
          id: parent.id,
          nombre: parent.nombre,
          apellido: parent.apellido,
          email: parent.email,
          telefono: parent.telefono,
          rol: 'padre',
          activo: parent.activo
        }))
      ];

      return staff;
    } catch (error) {
      console.error('Error en getAllStaff:', error);
      throw error;
    }
  },

  // Crear nuevo miembro del personal
  async createStaff(staffData) {
    try {
      let endpoint = '';
      if (staffData.rol === 'maestro') {
        endpoint = 'teachers';
      } else if (staffData.rol === 'estudiante') {
        endpoint = 'students';
      } else if (staffData.rol === 'padre') {
        endpoint = 'parents';
      }
      
      const response = await axios.post(`${API_URL}/${endpoint}`, staffData, getAuthHeaders());
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear personal');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en createStaff:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Error al crear personal'
      );
    }
  },

  // Actualizar miembro del personal
  async updateStaff(id, staffData) {
    try {
      let endpoint = '';
      if (staffData.rol === 'maestro') {
        endpoint = 'teachers';
      } else if (staffData.rol === 'estudiante') {
        endpoint = 'students';
      } else if (staffData.rol === 'padre') {
        endpoint = 'parents';
      }
      
      const response = await axios.put(`${API_URL}/${endpoint}/${id}`, staffData, getAuthHeaders());
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar personal');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en updateStaff:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Error al actualizar personal'
      );
    }
  },

  // Activar/Desactivar miembro del personal
  async toggleStaffStatus(id, role, activate = true) {
    try {
      let endpoint = '';
      if (role === 'maestro') {
        endpoint = 'teachers';
      } else if (role === 'estudiante') {
        endpoint = 'students';
      } else if (role === 'padre') {
        endpoint = 'parents';
      }
      
      const action = activate ? 'activate' : 'deactivate';
      const response = await axios.patch(
        `${API_URL}/${endpoint}/${id}/${action}`, 
        {}, 
        getAuthHeaders()
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || `Error al ${action} personal`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en toggleStaffStatus:', error);
      throw new Error(
        error.response?.data?.message || error.message || `Error al cambiar estado del personal`
      );
    }
  },

  // Método de fallback con datos de la base de datos existente
  async getFallbackTeachers() {
    // Simular llamada real a la base de datos basada en 03_data.sql
    return [
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'maestro1@example.com',
        telefono: '12345678',
        activo: true
      },
      {
        id: 2,
        nombre: 'María',
        apellido: 'Gómez',
        email: 'maestro2@example.com',
        telefono: '23456789',
        activo: true
      },
      {
        id: 3,
        nombre: 'Carlos',
        apellido: 'López',
        email: 'maestro3@example.com',
        telefono: '34567890',
        activo: true
      },
      {
        id: 4,
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'maestro4@example.com',
        telefono: '45678901',
        activo: true
      },
      {
        id: 5,
        nombre: 'Pedro',
        apellido: 'Sánchez',
        email: 'maestro5@example.com',
        telefono: '56789012',
        activo: true
      }
    ];
  },

  async getFallbackStudents() {
    // Simular llamada real a la base de datos basada en 03_data.sql
    return [
      {
        carnet: 1001,
        nombre: 'Juan',
        apellido: 'Gomez',
        email: 'N/A',
        telefono: 'N/A',
        estado: 'estudiante_activo'
      },
      {
        carnet: 1002,
        nombre: 'Maria',
        apellido: 'Lopez',
        email: 'N/A',
        telefono: 'N/A',
        estado: 'estudiante_activo'
      },
      {
        carnet: 1003,
        nombre: 'Carlos',
        apellido: 'Martinez',
        email: 'N/A',
        telefono: 'N/A',
        estado: 'estudiante_activo'
      },
      {
        carnet: 1004,
        nombre: 'Ana',
        apellido: 'Perez',
        email: 'N/A',
        telefono: 'N/A',
        estado: 'estudiante_activo'
      },
      {
        carnet: 1005,
        nombre: 'Luis',
        apellido: 'Gonzalez',
        email: 'N/A',
        telefono: 'N/A',
        estado: 'estudiante_activo'
      }
    ];
  },

  async getFallbackParents() {
    // Simular llamada real a la base de datos basada en 03_data.sql
    return [
      {
        id: 1,
        nombre: 'Carlos',
        apellido: 'Gomez',
        email: 'padre1@example.com',
        telefono: '12345678',
        activo: true
      },
      {
        id: 2,
        nombre: 'Luis',
        apellido: 'Lopez',
        email: 'padre2@example.com',
        telefono: '23456789',
        activo: true
      },
      {
        id: 3,
        nombre: 'Ricardo',
        apellido: 'Martinez',
        email: 'padre3@example.com',
        telefono: '34567890',
        activo: true
      },
      {
        id: 4,
        nombre: 'Jorge',
        apellido: 'Perez',
        email: 'padre4@example.com',
        telefono: '45678901',
        activo: true
      },
      {
        id: 5,
        nombre: 'Alejandro',
        apellido: 'Gonzalez',
        email: 'padre5@example.com',
        telefono: '56789012',
        activo: true
      }
    ];
  }
};