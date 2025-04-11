const express = require('express');
const router = express.Router();

const { applyLeave, getAllLeaveRequests, getMyLeaveRequests, approveLeave, rejectLeave} = require('../Controller/Leave/Leave.js');
const { auth, authorizeRoles } = require('../middleware/authMiddleware.js');


router.post('/apply', auth, authorizeRoles('employee'), applyLeave);
router.get('/my-leave-requests', auth, authorizeRoles('employee'), getMyLeaveRequests);
router.get('/all-leave-requests', auth, authorizeRoles('admin', 'hr'), getAllLeaveRequests);
router.patch('/approve/:id', auth, authorizeRoles('admin', 'hr'), approveLeave);
router.patch('/reject/:id', auth, authorizeRoles('admin', 'hr'), rejectLeave);

module.exports = router;