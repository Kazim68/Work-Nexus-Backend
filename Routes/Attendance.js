const express = require('express');
const router = express.Router();
const { clockIn, clockOut, getAttendanceSummary, getweeklyAttendance } = require('../Controller/Attendance/Attendance');
const {auth} = require('../middleware/authMiddleware')

router.post('/clockin/:employeeId', auth ,  clockIn);
router.post('/clockout/:employeeId', auth, clockOut);

router.get('/summary/:employeeId' ,auth , getAttendanceSummary);

router.get('/weekly/:employeeId'  , getweeklyAttendance);



module.exports = router;
