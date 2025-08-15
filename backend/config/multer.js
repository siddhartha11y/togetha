import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads'); // Save files here
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, name) => {
      if (err) return cb(err);
      const filename = name.toString('hex') + path.extname(file.originalname);
      cb(null, filename);
    });
  }
});

const upload = multer({ storage });

export default upload;
