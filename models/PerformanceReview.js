const mongoose = require('mongoose');

const performanceReviewSchema = new mongoose.Schema({
    EmployeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    ReviewerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    ReviewDate: {
        type: Date,
        required: true
    },
    Rating: {
        type: Number,
        required: true
    },
    Comments: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema);