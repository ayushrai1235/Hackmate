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

/**
 * Uploads a general chat attachment (image/document) to Cloudinary
 * @param {File} file - The attachment file to upload
 * @returns {Promise<{publicId: string, secureUrl: string}>}
 */
export const uploadChatAttachment = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload?type=chat', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};
