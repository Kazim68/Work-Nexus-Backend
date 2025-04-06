const express = require('express')
const { signUp, GenerateAndSendOtp, VerifyOtp, updateEmail, signIn } = require("../controller/auth.js"); 

const router = express.Router();


router.post('/signup' , signUp)
router.put('/update-email/:oldEmail', updateEmail);
router.post('/signin', signIn);




module.exports = router