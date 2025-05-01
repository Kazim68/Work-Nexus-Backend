const express = require('express');
const router = express.Router();
const { UserRoles } = require('../utils/Enums.js');
const { auth, authorizeRoles } = require('../middleware/authMiddleware.js');

const { generatePayslip, getMyPayroll, getAllPayrolls, getPayroll } = require('../Controller/Payroll/Payroll.js');



router.get('/generatePayslip', auth, generatePayslip);
router.get('/getMyPayroll', auth, getMyPayroll);
router.get('/getAllPayrolls', auth, getAllPayrolls);
router.get('/getPayroll/:employeeId/:year/:month', auth, getPayroll);


module.exports = router;