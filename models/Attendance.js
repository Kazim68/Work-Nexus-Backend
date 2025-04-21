const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    EmployeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    ClockInTime: {
        type: Date, 
    },
    ClockOutTime: {
        type: Date, 
    }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);