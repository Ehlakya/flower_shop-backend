const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Destination folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  // Log file name and MIME type before validation
  console.log(`🔍 [Upload Validation] File Name: ${file.originalname}, MIME Type: ${file.mimetype}`);

  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/svg+xml'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'];

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported image format. Allowed formats: JPG, PNG, WebP, AVIF, SVG'), false);
  }
};

const uploadInstance = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Wrap the single middleware to handle errors and return standard JSON instead of crashing
const originalSingle = uploadInstance.single;
uploadInstance.single = (fieldName) => {
  const middleware = originalSingle.call(uploadInstance, fieldName);
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        console.error('❌ Multer Upload Error:', err.message);
        return res.status(400).json({
          success: false,
          message: err.message || 'Unsupported image format. Allowed formats: JPG, PNG, WebP, AVIF, SVG'
        });
      }
      next();
    });
  };
};

module.exports = uploadInstance;

