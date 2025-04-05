const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    profilePic: {
        type: String,
    },
    EmployeeCode: {
        type: String,
    },
    FirstName: {
        type: String,
    },
    LastName: {
        type: String,
    },
    DateOfBirth: {
        type: Date,
    },
    Gender: {
        type: Boolean,
    },
    Address: {
        type: String,
    },
    PhoneNumber: {
        type: String,
    },
    Email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true,
    },
    Password: {
        type: String,
    },
    isPassLocked: {
        type: Boolean,
    },
    HireDate: {
        type: Date,
    },
    Status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'], // Example enum values
    },
    PositionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Position', // Reference to the Position table
    },
    Department: {
        type: String,
        enum: ['HR', 'IT', 'Finance', 'Sales'], // Example enum values
    },
    CompanyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', 
    },
    Documents: [{
        URL: {
            type: String,
            required: [true, 'Please provide document URL'],
        },
        category: {
            type: String,
            enum: ['Resume', 'Certificate', 'ID Proof'], // Example enum values
        },
        dateUploaded: {
            type: Date,
            default: Date.now,
        },
    }],
    IsVerified:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('Employee', EmployeeSchema);