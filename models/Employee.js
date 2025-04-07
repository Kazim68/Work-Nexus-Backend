const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const EmployeeSchema = new mongoose.Schema({
    userRole: {
        type: String,
        enum: ['admin', 'employee', 'HR'],
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
    },
    hireDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'], // Example enum values
    },
    positionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Position', // Reference to the Position table
    },
    department: {
        type: String,
        enum: ['HR', 'IT', 'Finance', 'Sales'], // Example enum values
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
            enum: ['Resume', 'Certificate', 'ID Proof'], // Example enum values
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
        { userId: this._id, name: this.email },
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