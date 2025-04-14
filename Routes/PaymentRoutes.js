const express = require('express')
const {checkoutSession , stripeWebHook } = require("../Controller/Payment/Payment");
const { auth, authorizeRoles } = require('../middleware/authMiddleware');
const { UserRoles } = require('../utils/Enums.js');

const router = express.Router();


//PAYMENT ROUTES
router.post('/create-checkout-session' , auth , authorizeRoles(UserRoles.ADMIN) , checkoutSession)
// router.post('/webhook', express.raw({ type: 'application/json' }) , stripeWebHook)

module.exports = router