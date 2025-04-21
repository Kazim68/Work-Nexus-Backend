const mongoose = require('mongoose');
const {IssueTypes , TokkenStatus} = require('../utils/Enums')


const TokenSchema = new mongoose.Schema({
    EmployeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    IssueType: {
        type: String,
        required: true,
        enum: [IssueTypes.PERSONAL , IssueTypes.ATTENDANCE, IssueTypes.SOFTWARE , IssueTypes.HARDWARE , IssueTypes.NETWORK , IssueTypes.OTHER], // Example issue types
    },
    Description: {
        type: String,
        required: true,
    },
    RaisedDate: {
        type: Date,
        required: true,
    },
    IssueDate: {
        type: Date,
        required: true,
    },
    Status: {
        type: String,
        required: true,
        enum: [TokkenStatus.OPEN , TokkenStatus.INPROGRESS , TokkenStatus.RESOLVED , TokkenStatus.REJECTED , TokkenStatus.CLOSED], // Example status values
    },
    AssignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
    },
    Issue: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Token', TokenSchema);