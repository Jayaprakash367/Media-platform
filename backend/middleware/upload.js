const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage for processing before upload to Cloudinary
const memoryStorage = multer.memoryStorage();

// File filters
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP images are allowed.'), false);
  }
};

const videoFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, MOV, and AVI videos are allowed.'), false);
  }
};

// Upload middleware
const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only 1 file at a time
  }
});

const uploadVideo = multer({
  storage: memoryStorage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1 // Only 1 file at a time
  }
});

const uploadMedia = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1
  }
}).single('media');

const uploadProfilePicture = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  }
}).single('profilePicture');

// Helper function to determine media type and upload to appropriate storage
const uploadMediaToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (!isImage && !isVideo) {
      return reject(new Error('Invalid media type'));
    }

    const folder = isImage ? 'instagram-clone/images' : 'instagram-clone/videos';
    const resourceType = isImage ? 'image' : 'video';

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      quality: 'auto',
      fetch_format: isImage ? 'auto' : undefined
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            mediaType: resourceType
          });
        }
      }
    ).end(file.buffer);
  });
};

// Utility function to delete media from Cloudinary
const deleteMediaFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw new Error('Error deleting media from Cloudinary: ' + error.message);
  }
};

module.exports = {
  uploadImage,
  uploadVideo,
  uploadMedia,
  uploadProfilePicture,
  uploadMediaToCloudinary,
  deleteMediaFromCloudinary,
  cloudinary
};
