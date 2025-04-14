const mongoose = require('mongoose');
const { PricingPlans } = require('../utils/Enums.js');



const pricingPlanSchema = new mongoose.Schema({
    planType: {
        type: String,
        enum: [PricingPlans.BASIC, PricingPlans.STANDARD, PricingPlans.PREMIUM],
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',  // Reference to the Employee model
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PricingPlan', pricingPlanSchema);
