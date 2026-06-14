/**
 * Compresses an image file client-side using canvas.
 * Handles JPG, JPEG, PNG, and WEBP formats. Converts PNGs to JPEG for optimal size if preferred.
 * @param {File} file - The original image file
 * @param {object} [options] - Compression options
 * @param {number} [options.maxWidth=1024] - Max width of compressed image
 * @param {number} [options.maxHeight=1024] - Max height of compressed image
 * @param {number} [options.quality=0.7] - Quality of compression (0 to 1)
 * @returns {Promise<File>} The compressed file
 */
export const compressImage = (file, options = {}) => {
  const { maxWidth = 1024, maxHeight = 1024, quality = 0.7 } = options;

  // Check if it is a compressible image
  const compressibleTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!compressibleTypes.includes(file.type)) {
    console.log(`File type ${file.type} is not compressible, bypassing compression.`);
    return Promise.resolve(file);
  }

  // GIFs are not compressible via normal canvas draw without losing animation frames
  if (file.type === 'image/gif') {
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio compliant sizing
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas output back to a File
        const mimeType = file.type === 'image/png' ? 'image/jpeg' : file.type; // converting png to jpeg reduces size dramatically
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            });
            
            console.log(`Compressed image from ${Math.round(file.size / 1024)}KB to ${Math.round(compressedFile.size / 1024)}KB`);
            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };
      
      img.onerror = (err) => {
        console.error('Image load error during compression:', err);
        resolve(file); // Fallback to raw file on error
      };
    };
    
    reader.onerror = (err) => {
      console.error('FileReader error during compression:', err);
      resolve(file);
    };
  });
};
