const express = require('express')
const {checkoutSession , stripeWebHook } = require("../Controller/Payment/Payment");

const router = express.Router();


//PAYMENT ROUTES
router.post('/create-checkout-session' , checkoutSession)
router.post('/webhook', express.raw({ type: 'application/json' }) , stripeWebHook)

module.exports = router