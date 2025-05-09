const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { UserRoles, UserStatus, Departments, DocumentTypes , Position } = require('../utils/Enums.js');

const EmployeeSchema = new mongoose.Schema({
    userRole: {
        type: String,
        enum: [UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.HR],
    },
    profilePic: {
        type: String,
    },
    employeeCode: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    name: {
        type: String
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: Boolean,
    },
    address: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true,
    },
    password: {
        type: String,
    },
    isPassLocked: {
        type: Boolean,
        default: false,
    },
    hireDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED], 
        default: UserStatus.ACTIVE,
    },
    position: {
        type: String,
    },
    salary: {
        type: Number,
        default: 80000,
        required: true
    },
    department: {
        type: String, 
    },
    companyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', 
    },
    documents: [{
        URL: {
            type: String,
            required: [true, 'Please provide document URL'],
        },
        category: {
            type: String,
            enum: [DocumentTypes.RESUME, DocumentTypes.EXPERIENCE_CERTIFICATE, DocumentTypes.ID_PROOF, DocumentTypes.PAYSLIP, DocumentTypes.OTHER],
        },
        dateUploaded: {
            type: Date,
            default: Date.now,
        },
    }],
    isVerified:{
        type:Boolean,
        default:false
    },
    PF_FundPerMonth: {
        type: Number,
        default: 0
    },
    PR_FundTotal: {
        type: Number,
        default: 0
    },
    LeaveInfo: {
        AnnualLeaves: {
            type: Number,
            required: true,
            default: 30
        },
        RemainingLeaves: {
            type: Number,
            required: true,
            default: 30
        },
        UnpaidLeaves: {
            type: Number,
            required: true,
            default: 0
        },
        LastResetDate: {
            type: Date,
            default: Date.now
        }
    },

    resetPasswordToken: String,         
    resetPasswordExpire: Date, 
    
});

EmployeeSchema.pre('save', async function () {
    if (!this.isModified('password')) return 
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

EmployeeSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, email: this.email, role: this.userRole },
        process.env.JWT_SECRET,
        {
        expiresIn: process.env.JWT_LIFETIME,
        }
    )
}

EmployeeSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password)
    return isMatch
}

// Generate and hash password reset token
EmployeeSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex')

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Set expire time (e.g., 10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

    return resetToken
}


module.exports = mongoose.model('Employee', EmployeeSchema);