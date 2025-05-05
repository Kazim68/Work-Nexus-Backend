const express = require('express')
const { getAllEmployees, createEmployee , increaseLeaveBalance , bulkUpload, changePassword } = require('../Controller/Employee/Employee.js') 
const upload = require('../Utils/Multer.js')
const { authorizeRoles, auth } = require('../middleware/authMiddleware.js')
const { UserRoles } = require('../utils/Enums.js');

const router = express.Router()

router.get('/all', getAllEmployees)
router.post('/create', createEmployee)

router.post("/upload/:companyId", auth , authorizeRoles(UserRoles.ADMIN) , upload.single("employees") ,bulkUpload)

//Added reset password route
router.post('/change-password', auth , changePassword);

module.exports = router