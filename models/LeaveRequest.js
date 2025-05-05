const mongoose = require('mongoose');
const { LeaveTypes, LeaveStatus } = require('../utils/Enums.js');

const LeaveRequestSchema = new mongoose.Schema({
    EmployeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    LeaveStartDate: {
        type: Date,
        required: true
    },
    LeaveEndDate: {
        type: Date,
        required: true
    },
    LeaveType: {
        type: String,
        required: true,
        enum: [LeaveTypes.SICK, LeaveTypes.CASUAL, LeaveTypes.EARNED, LeaveTypes.UNPAID]
    },
    LeaveReason: {
        type: String,
        required: true
    },
    LeaveStatus: {
        type: String,
        required: true,
        enum: [LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED],
        default: LeaveStatus.PENDING
    },
    LeaveApplyDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);