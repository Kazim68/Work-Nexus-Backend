require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDb = require('./dB/connect.js')


const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes


// server
const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDb(process.env.MONGO_URL);
        console.log('Database connected')
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        })
    }
    catch (err) {
        console.log(err);
    }
}
start()