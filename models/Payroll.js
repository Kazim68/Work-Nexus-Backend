const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
    EmployeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    Month: {
        type: String,
        required: true
    },
    Year: {
        type: Number,
        required: true
    },
    BasicSalary: {
        type: Number,
        required: true
    },
    Deductions: {
        type: Number,
        required: true
    },
    Allowances: {
        type: Number,
        required: true
    },
    NetSalary: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Payroll', PayrollSchema);