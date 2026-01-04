const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/images', 'uploads/videos', 'uploads/documents', 'uploads/avatars'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'image' || file.fieldname === 'avatar' || file.fieldname === 'photo') {
      uploadPath += 'images/';
    } else if (file.fieldname === 'video') {
      uploadPath += 'videos/';
    } else if (file.fieldname === 'document') {
      uploadPath += 'documents/';
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  const allowedDocTypes = ['application/pdf'];

  if (file.fieldname === 'image' || file.fieldname === 'avatar' || file.fieldname === 'photo') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
    }
  } else if (file.fieldname === 'video') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (MP4, WebM, OGG) are allowed'), false);
    }
  } else if (file.fieldname === 'document') {
    if (allowedDocTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed'), false);
    }
  } else {
    cb(null, true);
  }
};

// Upload configurations
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  }
});

// Project upload (image, video, document)
const projectUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]);

// Avatar upload
const avatarUpload = upload.single('avatar');

// Event image upload
const eventImageUpload = upload.single('image');

module.exports = {
  upload,
  projectUpload,
  avatarUpload,
  eventImageUpload
};
