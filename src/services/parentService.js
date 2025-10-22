
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
  },
  async getChildPaymentHistory(studentId, startDate = null, endDate = null) {
    let url = `${API_URL}/${studentId}/payments`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const res = await axios.get(url, getAuthHeaders());
    return res.data;
  },
  async getChildPendingPayments(studentId) {
    const res = await axios.get(`${API_URL}/${studentId}/payments/pending`, getAuthHeaders());
    return res.data;
  },
  async checkPaymentSolvency(studentId) {
    const res = await axios.get(`${API_URL}/${studentId}/solvency`, getAuthHeaders());
    return res.data;
  }
};
