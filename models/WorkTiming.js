const mongoose = require('mongoose');

const WorkTimingSchema = new mongoose.Schema({
    CompanyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    DayOfWeek: {
        type: String,
        required: true
    },
    CheckInTime: {
        type: String, // Using String to represent time in HH:mm format
        required: true
    },
    CheckOutTime: {
        type: String, // Using String to represent time in HH:mm format
        required: true
    }
});

module.exports = mongoose.model('WorkTiming', WorkTimingSchema);