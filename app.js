require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDb = require('./dB/connect.js');
const Logger = require('./middleware/Logger.js');

// Routes
const AuthRoutes = require("./Routes/AuthRoutes.js");
const OtpRoutes = require("./Routes/otpRoutes.js");
const ResetPasswordRoutes = require("./Routes/ResetPasswordRoutes.js");
const PaymentRoutes = require("./Routes/PaymentRoutes.js");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(Logger); // Make sure logger runs before routes

// Mount routes
app.use('/api/auth', AuthRoutes);
app.use('/api/otp', OtpRoutes);
app.use('/api/reset-password', ResetPasswordRoutes);
app.use('/api/payment', PaymentRoutes);


// Server
const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDb(process.env.MONGO_URL);
        console.log('Database connected');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.log(err);
    }
};

start();
