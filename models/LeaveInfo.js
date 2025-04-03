const mongoose = require('mongoose');

const LeaveInfoSchema = new mongoose.Schema({
    EmployeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    LeaveType: {
        type: String,
        required: true,
        enum: ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave']
    },
    TotalLeaves: {
        type: Number,
        required: true
    },
    UsedLeaves: {
        type: Number,
        required: true
    },
    RemainingLeaves: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('LeaveInfo', LeaveInfoSchema);