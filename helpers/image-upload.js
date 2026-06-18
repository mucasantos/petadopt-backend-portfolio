const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/i)) {
      return cb(new Error('Please upload only images (png, jpg, jpeg)!'), false);
    }
    cb(null, true);
  }
});

module.exports = { upload };
