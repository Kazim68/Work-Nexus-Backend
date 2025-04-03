const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    EmployeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    AttendanceDate: {
        type: Date,
        required: true
    },
    ClockInTime: {
        type: Number, 
    },
    ClockOutTime: {
        type: Number, 
    }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);