const express = require('express');
const Stripe = require('stripe');
const Employee = require('../../models/Employee');
const PricingPlan = require('../../models/PricingPlan')
const moment = require('moment');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');

// Create Stripe Checkout Session
const checkoutSession = async (req, res) => {
  const { amount, employeeId, planType } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount * 100, // Convert to cents
            product_data: {
              name: planType + ' Plan',
            },
          },
          quantity: 1,
        },
      ],
      success_url: 'https://worknexus-indol.vercel.app/orgInfo',
      cancel_url: 'http://localhost:3000/payment-cancel',
      metadata: {
        employeeId,
        planType,
        price: amount,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
};


const stripeWebHook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const employeeId = session.metadata.employeeId;
    const planType = session.metadata.planType;
    const price = session.metadata.price;

    try {
      const employee = await Employee.findById(new mongoose.Types.ObjectId(employeeId));
      if (!employee) throw new Error('Employee not found');

      const expiresAt = moment().add(30, 'days').toDate();

      let pricingPlan = await PricingPlan.findOne({ employeeId: employee._id });

      if (pricingPlan) {
        pricingPlan.planType = planType;
        pricingPlan.price = price;
        pricingPlan.expiresAt = expiresAt;
        pricingPlan.isActive = true;
      } else {
        pricingPlan = new PricingPlan({
          employeeId: employee._id,
          planType,
          price,
          expiresAt,
          isActive: true,
        });
      }

      await pricingPlan.save();
      console.log(`Plan updated/created for employee ${employeeId}`);
    } catch (error) {
      console.error('Error updating/creating plan from webhook:', error.message);
    }
  }

  res.json({ received: true });
};

  


module.exports = {checkoutSession , stripeWebHook}
