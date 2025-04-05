const express = require('express')
const { SignUp, GenerateAndSendOtp, VerifyOtp, UpdateEmail, Signin } = require("../Controller/Auth/Signup"); 


const router = express.Router();



router.post('/signup' , SignUp)

router.post('/sendotp' , GenerateAndSendOtp)

router.post('/verifyotp' , VerifyOtp)

router.put('/update-email/:oldEmail', UpdateEmail);


router.post('/signin', Signin);




module.exports = router