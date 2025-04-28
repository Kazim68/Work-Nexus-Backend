const express = require('express');
const router = express.Router();
const {auth, authorizeRoles} = require('../middleware/authMiddleware');
const upload = require('../Utils/Multer');
const { UserRoles } = require('../utils/Enums.js');
const {
  createCompany,
  uploadDocuments,
  getDepartmentsWithPositions,
  getEmployeesByCompany,
  updateWorkTimings
} = require('../Controller/Company/Company');



// Auth-protected routes
router.post('/register', auth, authorizeRoles(UserRoles.ADMIN), createCompany);

router.post("/upload", auth, authorizeRoles(UserRoles.ADMIN), upload.fields([
    { name: 'documents', maxCount: 5 },
    { name: 'logo', maxCount: 1 }
]), uploadDocuments);
  

router.get('/departments-with-positions/:companyId', getDepartmentsWithPositions);

router.get('/getEmployees/:companyId', auth ,  getEmployeesByCompany);


router.put('/updateTime/:id', auth , updateWorkTimings);





module.exports = router;
