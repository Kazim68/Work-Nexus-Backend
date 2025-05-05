require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDb = require('./dB/connect.js');
const Logger = require('./middleware/Logger.js');
const rawExpress = require('./utils/RawExpress.js')
const http = require('http');
const { setupSocket } = require('./utils/Socket.js');

// Routes
const AuthRoutes = require("./Routes/AuthRoutes.js");
const OtpRoutes = require("./Routes/OtpRoutes.js");
const ResetPasswordRoutes = require("./Routes/ResetPasswordRoutes.js");
const PaymentRoutes = require("./Routes/PaymentRoutes.js");


const app = express();

// Middleware
app.use(cors({
  origin: "https://worknexus-indol.vercel.app/", // your frontend URL
  credentials: true // allow cookies and auth headers
}));


rawExpress(app)


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(Logger); // Make sure logger runs before routes

// Mount routes
app.use('/api/auth', AuthRoutes);
app.use('/api/otp', OtpRoutes);
app.use('/api/reset-password', ResetPasswordRoutes);
app.use('/api/payment', PaymentRoutes);
app.use('/api/leave', require('./Routes/LeaveRoutes.js'));
app.use('/api/employee', require('./Routes/EmployeeRoutes.js'));
app.use('/api/notifications', require('./Routes/NotificationsRouter.js'));

app.use('/api/company', require('./Routes/CompanyRoutes.js'));
app.use('/api/attendance', require('./Routes/Attendance.js'));
app.use('/api/token', require('./Routes/TokenRoutes.js'));
app.use('/api/payroll', require('./Routes/PayrollRoutes.js'));



// socket.io setup
const server = http.createServer(app);
setupSocket(server);


// Server
const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDb(process.env.MONGO_URL);
        console.log('Database connected');
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.log(err);
    }
};

start();
