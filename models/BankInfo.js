const mongoose = require('mongoose');

const BankInfoSchema = new mongoose.Schema({
    EmployeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    BankName: {
        type: String,
        required: true,
    },
    AccountHolderName: {
        type: String,
        required: true,
    },
    AccountNumber: {
        type: String, // Changed to String to handle leading zeros
        required: true,
    },
    PaymentMethod: {
        type: String,
        enum: ['BankTransfer', 'Cheque', 'Other'], // Added enum for validation
        required: true,
    },
    BranchAddress: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('BankInfo', BankInfoSchema);