const express = require('express')
const { generateAndSendVerificationLink, verifyRecoveryToken, resetPassword } = require('../Controller/Auth/RecoverPassword');


const router = express.Router();


//RESET PASSWORD ROUTES
router.post('/send-recovery-link', generateAndSendVerificationLink);
router.get('/verify-token' , verifyRecoveryToken)
router.post('/update-password', resetPassword);


module.exports = router