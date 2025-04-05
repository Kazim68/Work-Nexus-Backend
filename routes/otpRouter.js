const express = require('express')
const { GenerateAndSendOtp, VerifyOtp } = require("../controller/otp.js");

const router = express.Router();

router.post('/sendotp' , GenerateAndSendOtp)
router.post('/verifyotp' , VerifyOtp)

module.exports = router