const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Ensure this is not '127.0.0.1'
    port: 587, 
    secure: false,
    connectionTimeout: 10 * 1000,   // 10 s
    greetingTimeout: 10 * 1000,
    socketTimeout: 10 * 1000,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Send OTP email
const sendEmail = async (email , subject , text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: text,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(`Error sending OTP email: ${error}`)
    }
};

module.exports = {sendEmail}
