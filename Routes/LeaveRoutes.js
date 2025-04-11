const express = require('express');
const router = express.Router();
const { UserRoles } = require('../utils/Enums.js');

const { applyLeave, getAllLeaveRequests, getMyLeaveRequests, approveLeave, rejectLeave} = require('../Controller/Leave/Leave.js');
const { auth, authorizeRoles } = require('../middleware/authMiddleware.js');
const { increaseLeaveBalance } = require('../Controller/Employee/Employee.js');


router.post('/apply', auth, authorizeRoles(UserRoles.EMPLOYEE), applyLeave);
router.get('/my-leave-requests', auth, authorizeRoles(UserRoles.EMPLOYEE), getMyLeaveRequests);
router.get('/all-leave-requests', auth, authorizeRoles(UserRoles.ADMIN, UserRoles.HR), getAllLeaveRequests);
router.patch('/approve/:leaveId',auth, authorizeRoles(UserRoles.ADMIN, UserRoles.HR), approveLeave);
router.patch('/reject/:leaveId', auth, authorizeRoles(UserRoles.ADMIN, UserRoles.HR), rejectLeave);
router.patch('/increase-leave-balance', auth, authorizeRoles(UserRoles.ADMIN, UserRoles.HR), increaseLeaveBalance);


module.exports = router;