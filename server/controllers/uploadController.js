import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isChat = req.query.type === 'chat' || req.body.type === 'chat';
    const folder = isChat ? 'hackmate_chats' : 'hackmate_avatars';

    // Convert file buffer to base64 Data URI
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploadOptions = {
      folder,
      resource_type: 'auto',
    };

    // Only apply cropping for avatar images
    if (!isChat) {
      uploadOptions.transformation = [
        { width: 300, height: 300, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
      ];
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileStr, uploadOptions);

    return res.status(200).json({
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
  }
};
