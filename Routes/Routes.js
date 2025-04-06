const express = require('express')
const { signUp } = require("../Controller/Auth/Signup");
const { generateAndSendOtp, verifyOtp } = require("../Controller/Auth/OTP")
const { signIn } = require("../Controller/Auth/SignIn");
const {updateEmail} = require("../Controller/Employee/Employee");
const { generateAndSendVerificationLink, verifyRecoveryToken, resetPassword } = require('../Controller/Auth/RecoverPassword');



const router = express.Router();


//SIGNUP ROUTES
router.post('/signUp', signUp)

//OTP ROUTES
router.post('/sendotp', generateAndSendOtp)
router.post('/verifyOtp', verifyOtp)


//SIGNIN ROUTES
router.post('/signIn', signIn);


//UPDATE EMPLOYEE EMAIL ROUTES
router.put('/update-email/:oldEmail', updateEmail);

//RESET PASSWORD ROUTES
router.post('/send-recovery-link', generateAndSendVerificationLink);
router.get('/verify-token' , verifyRecoveryToken)
router.post('/reset-password', resetPassword);


module.exports = router