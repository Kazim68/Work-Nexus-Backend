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
    } else if(file.fieldname === 'employees'){
      folder = 'uploads/Company/employees';

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
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and Excel files are allowed.'), false);
  }
};

  
  // Handling multiple fields (documents, logo)
const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = upload;
