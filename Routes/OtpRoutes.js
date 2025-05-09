const express = require('express')
const { generateAndSendOtp, verifyOtp } = require("../Controller/Auth/OTP");

const router = express.Router();


//OTP ROUTES
router.post('/sendotp' , generateAndSendOtp)
router.post('/verifyotp' , verifyOtp)

module.exports = router