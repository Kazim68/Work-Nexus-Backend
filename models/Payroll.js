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
    Deductions: {
        Tax: {
            type: Number,
            required: true,
            default: 2500
        },
        PF_Funds: {
            type: Number,
            required: true,
            default: 2000
        },
        Absents: {
            type: Number,
            required: true,
            default: 0
        },
        AbsentsFine: {
            type: Number,
            required: true,
            default: 0
        },
        Other: {
            type: Number,
            required: true,
            default: 0
        }
    },
    Allowances: {
        BasicSalary: {
            type: Number,
            required: true
        },
        Utilities: {
            type: Number,
            required: true,
            default: 2000
        },
        MedicalExpenses: {
            type: Number,
            required: true,
            default: 5000
        },
        Fuel: {
            type: Number,
            required: true,
            default: 2000
        },
        OvertimePay: {
            type: Number,
            required: true,
            default: 0
        },
        OvertimeHours: {
            type: Number,
            required: true,
            default: 0
        },
        Other: {
            type: Number,
            required: true,
            default: 0
        }
    },
    Contributions: {
        EmployeePF_Fund: {
            type: Number,
            required: true,
            default: 0
        },
        EmployerPF_Fund: {
            type: Number,
            required: true,
            default: 0
        }
    },
    Leaves: {
        Sick: { type: Number, default: 0 },
        Casual: { type: Number, default: 0 },
        Annual: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model('Payroll', PayrollSchema);