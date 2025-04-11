const mongoose = require('mongoose');

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
        enum: ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave']
    },
    LeaveReason: {
        type: String,
        required: true
    },
    LeaveStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Approved', 'Rejected'] // Example statuses
    }
});

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);