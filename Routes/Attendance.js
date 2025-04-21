const express = require('express');
const router = express.Router();
const { clockIn, clockOut, getAttendanceSummary } = require('../Controller/Attendance/Attendance');
const {auth} = require('../middleware/authMiddleware')

router.post('/clockin/:employeeId', auth ,  clockIn);
router.post('/clockout/:employeeId', auth, clockOut);

router.get('/summary/:employeeId' ,auth , getAttendanceSummary);


module.exports = router;
