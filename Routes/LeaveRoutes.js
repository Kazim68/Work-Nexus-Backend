const express = require('express');
const router = express.Router();
const { UserRoles } = require('../utils/Enums.js');
const { auth, authorizeRoles } = require('../middleware/authMiddleware.js');

const { applyLeave, allPendingLeaves, getLeaveRequestsSummaryForHR, getMyLeaveRequests,
    cancelLeaveRequest, employeeLeaveSummary, getAllLeavesOfMonth,
    approveLeave, rejectLeave, resetLeaveBalanceOfAllEmployees } = require('../Controller/Leave/Leave.js');
const { increaseLeaveBalance } = require('../Controller/Employee/Employee.js');


router.post('/apply', auth, authorizeRoles(UserRoles.EMPLOYEE, UserRoles.ADMIN, UserRoles.HR), applyLeave);
router.get('/my-leave-requests', auth, authorizeRoles(UserRoles.EMPLOYEE), getMyLeaveRequests);
router.patch('/approve/:leaveId',auth, authorizeRoles(UserRoles.ADMIN, UserRoles.HR), approveLeave);
router.patch('/reject/:leaveId', auth, authorizeRoles(UserRoles.ADMIN, UserRoles.HR), rejectLeave);
router.patch('/increase-leave-balance', auth, authorizeRoles(UserRoles.ADMIN, UserRoles.HR), increaseLeaveBalance);
router.patch('/reset-leave-balance', auth, authorizeRoles(UserRoles.ADMIN, UserRoles.HR), resetLeaveBalanceOfAllEmployees);
router.delete('/cancelLeave/:leaveId', auth, authorizeRoles(UserRoles.EMPLOYEE, UserRoles.ADMIN, UserRoles.HR), cancelLeaveRequest); 
router.get('/employee-leave-summary/:employeeId', auth, employeeLeaveSummary);
router.get('/all-pending-leaves', auth, authorizeRoles(UserRoles.ADMIN, UserRoles.HR), allPendingLeaves);
router.get('/LeaveRequestsSummary', auth, authorizeRoles(UserRoles.ADMIN, UserRoles.HR), getLeaveRequestsSummaryForHR);
router.get('/allLeavesOfMonth', auth, authorizeRoles(UserRoles.ADMIN, UserRoles.HR), getAllLeavesOfMonth);


module.exports = router;