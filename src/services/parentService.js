
import axios from 'axios';
import { getAuthHeaders } from '@/utils/auth.js';

const API_URL = import.meta.env.VITE_API_URL + '/api/parent';

export const parentService = {
  async getChildren() {
    const res = await axios.get(`${API_URL}/children`, getAuthHeaders());
    return res.data;
  },
  async getStudentGrades(studentId) {
    const res = await axios.get(`${API_URL}/${studentId}/grades`, getAuthHeaders());
    return res.data;
  },
  async getStudentTaskGrades(studentId, subjectId) {
    const res = await axios.get(`${API_URL}/${studentId}/grades/${subjectId}/tasks`, getAuthHeaders());
    return res.data;
  }
};
