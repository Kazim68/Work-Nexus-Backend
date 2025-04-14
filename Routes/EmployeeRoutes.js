const express = require('express')
const { getAllEmployees, createEmployee , increaseLeaveBalance , bulkUpload } = require('../Controller/Employee/Employee.js') 
const upload = require('../Utils/Multer.js')
const { authorizeRoles, auth } = require('../middleware/authMiddleware.js')
const { UserRoles } = require('../utils/Enums.js');

const router = express.Router()

router.get('/all', getAllEmployees)
router.post('/create', createEmployee)

router.post("/upload/:companyId", auth , authorizeRoles(UserRoles.ADMIN) , upload.single("employees") ,bulkUpload)

module.exports = router