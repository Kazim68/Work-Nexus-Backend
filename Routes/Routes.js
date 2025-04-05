const express = require('express')
const { SignUp, GenerateAndSendOtp, VerifyOtp } = require("../Controller/Auth/Signup"); 


const router = express.Router();

console.log("Signup route registered...");

router.post('/signup' , SignUp)

router.post('/sendotp' , GenerateAndSendOtp)

router.post('/verifyotp' , VerifyOtp)





module.exports = router