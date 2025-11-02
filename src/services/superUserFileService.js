import axios from 'axios';

class SuperUserFileService {
  constructor() {
    this.baseURL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/superuser/planifications`;
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get all files for a specific planification
   * @param {string} planificationId - The planification ID
   */
  async getPlanificationFiles(planificationId) {
    try {
      const response = await axios.get(`${this.baseURL}/${planificationId}/files`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching planification files:', error);
      throw error;
    }
  }

  /**
   * Download a file using presigned URL from backend
   * @param {Object} file - The file object with id and original_name
   */
  async downloadFile(file) {
    try {
      // Get presigned download URL from backend
      const response = await axios.get(`${this.baseURL}/files/${file.id}/download`, {
        headers: this.getAuthHeaders()
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener la URL de descarga');
      }

      // Use the presigned URL to download the file
      const downloadLink = document.createElement('a');
      downloadLink.style.display = 'none';
      downloadLink.href = response.data.downloadUrl;
      downloadLink.download = response.data.fileName || file.original_name;
      downloadLink.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      return true;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
}

export default new SuperUserFileService();