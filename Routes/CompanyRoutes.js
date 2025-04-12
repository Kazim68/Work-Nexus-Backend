const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/authMiddleware');
const upload = require('../Utils/Multer');
const {
  createCompany,
  uploadDocuments
} = require('../Controller/Company/Company');



// Auth-protected routes
router.post('/register', auth, createCompany);

router.post("/upload", auth, upload.fields([
    { name: 'documents', maxCount: 5 },
    { name: 'logo', maxCount: 1 }
  ]), uploadDocuments);
  

module.exports = router;


module.exports = router;
