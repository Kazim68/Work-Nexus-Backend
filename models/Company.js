const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    CompanyName: {
        type: String,
        required: true
    },
    CompanyType: {
        type: String,
        enum: ['StartUp', 'Enterprise', 'Non Profit'], // Example enum values
        required: true
    },
    EmployeeCount: {
        type: String,
        required: true,
    },
    Address: {
        type: String,
        required: true
    },
    ContactEmail: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true,
    },
    ContactPhone: {
        type: String,
        required: true
    },
    Documents: {
        type: [String], // Array of strings
        default: []
    },
    WorkTimings: {
        type: [String], // Array of strings
        default: []
    },
    CompanyStatus: {
        type: Boolean,
        required: true
    },
    CompanyLogo: {
        type: String,
        required: false
    },
    PricingPlan: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Company', CompanySchema);