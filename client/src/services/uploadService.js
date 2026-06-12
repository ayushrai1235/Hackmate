import api from './api';

/**
 * Uploads an avatar image to Cloudinary via the backend proxy
 * @param {File} file - The image file to upload
 * @returns {Promise<{publicId: string, secureUrl: string}>}
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
