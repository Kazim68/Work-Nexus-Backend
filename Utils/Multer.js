// multer.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'uploads/others'; // default

    // Set folder based on field name
    if (file.fieldname === 'documents') {
      folder = 'uploads/Company/Documents';
    } else if (file.fieldname === 'logo') {
      folder = 'uploads/Company/logos';
    }

    // Ensure the folder exists
    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
  
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true); // Accept PDF and JPEG files
    } else {
      cb(new Error('Invalid file type. Only PDF and JPEG files are allowed.'), false);
    }
  };
  
  // Handling multiple fields (documents, logo)
const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = upload;
