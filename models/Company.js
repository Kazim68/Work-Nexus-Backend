const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    companyType: {
        type: String,
        enum: ['StartUp', 'Enterprise', 'Non Profit'],
        required: true
    },
    employeeCount: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true,
    },
    contactPhone: {
        type: String,
        required: true
    },
    documents: {
        type: [String],
        default: []
    },
    workTimings: {
        type: [String],
        default: []
    },
    companyStatus: {
        type: Boolean,
        required: true
    },
    companyLogo: {
        type: String,
        required: false
    },
    pricingPlan: {
        type: String,
        required: true
    },
});


module.exports = mongoose.model('Company', CompanySchema);