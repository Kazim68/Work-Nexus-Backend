const express = require('express')
const { signUp } = require("../Controller/Auth/Signup"); 
const {updateEmail} = require("../Controller/Employee/Employee")
const { signIn } = require("../Controller/Auth/SignIn")
const { googleAuth } = require("../Controller/Auth/GoogleOAuth");

const router = express.Router();

//AUTH ROUTES
router.post('/signup' , signUp)
router.put('/update-email/:oldEmail', updateEmail);
router.post('/signin', signIn);


// GOOGLE AUTH ROUTES
router.get("/google", googleAuth);




module.exports = router