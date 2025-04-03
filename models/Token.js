const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    EmployeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    IssueType: {
        type: String,
        required: true,
        enum: ['Hardware', 'Software', 'Network', 'Other'], // Example issue types
    },
    Description: {
        type: String,
        required: true,
    },
    RaisedDate: {
        type: Date,
        required: true,
    },
    Status: {
        type: String,
        required: true,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'], // Example status values
    },
    AssignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    issue: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Token', TokenSchema);