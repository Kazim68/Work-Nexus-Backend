const express = require('express');
const { stripeWebHook } = require('../Controller/Payment/Payment');

const rawExpress = (app) => {
  app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebHook);
};

module.exports = rawExpress;

