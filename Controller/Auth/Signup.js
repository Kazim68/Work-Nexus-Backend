const Employee = require('../../models/Employee')
const customError = require('../../Utils/Error')
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const OTP = require('../../models/OTPVerification');
const jwt = require("jsonwebtoken");

const SignUp = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Validate input fields
        if (!firstName || !lastName || !email || !password) {
            return next(customError(400, "All fields are required"));
        }

        // Check if email already exists
        const existingUser = await Employee.findOne({ email });
        if (existingUser) {
            return next(customError(409, "Email is already in use"));
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new employee
        const newEmployee = new Employee({
            FirstName: firstName,
            LastName: lastName,
            Email: email,
            Password: hashedPassword,
        });

        await newEmployee.save();

        res.status(201).json({ success: true, message: "Employee registered successfully" });

    } catch (error) {
        next(error); // Pass error to middleware
    }
};

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Ensure this is not '127.0.0.1'
    port: 587, 
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Generate a 4-digit OTP
const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
};

// Send OTP email
const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error)
        throw new Error('Error sending OTP email');
    }
};

const GenerateAndSendOtp = async (req, res) => {
    const { email } = req.body;

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // OTP expires in 10 minutes

    try {
        // Hash the OTP before storing
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Check if OTP already exists for this email
        const existingOtp = await OTP.findOne({ email });

        if (existingOtp) {
            existingOtp.otp = hashedOtp;
            existingOtp.expiresAt = expiresAt;
            await existingOtp.save();
        } else {
            const newOtp = new OTP({ email, otp: hashedOtp, expiresAt });
            await newOtp.save();
        }

        // Send OTP via email
        await sendOtpEmail(email, otp); // Send the plain OTP, not the hashed one

        return res.status(200).json({ message: "OTP sent successfully to your email" });
    } catch (error) {
        console.error("Error generating OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const VerifyOtp = async (req, res) => {
    
    const { email, otp } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required." });
    }

    try {
        const existingOtp = await OTP.findOne({ email });

        if (!existingOtp) {
            return res.status(400).json({ message: "OTP not found. Request a new one." });
        }

        // Check if OTP is expired
        if (Date.now() > existingOtp.expiresAt) {
            return res.status(400).json({ message: "OTP expired. Request a new one." });
        }

        // Compare OTP with the hashed OTP in the database
        const isOtpValid = await bcrypt.compare(otp, existingOtp.otp);

        if (!isOtpValid) {
            
            return res.status(400).json({ message: "Invalid OTP." });
        }

        //OTP is valid, delete it from DB after verification
        
        const updatedEmployee = await Employee.findOneAndUpdate(
            { Email: email },
            { $set: { IsVerified: true } },
            { new: true }
        );


        if (!updatedEmployee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        return res.status(200).json({ message: "OTP verified successfully!" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

const UpdateEmail = async (req, res) => {
    const { oldEmail } = req.params;
    const { newEmail } = req.body;

    if (!newEmail) {
        return res.status(400).json({ success: false, message: 'New email is required' });
    }

    try {
        const user = await Employee.findOne({ Email: oldEmail });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with the given email' });
        }

        user.Email = newEmail;
        await user.save();

        res.status(200).json({ success: true, message: 'Email updated successfully', email: newEmail });
    } catch (err) {
        console.error("Update Email Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


const Signin = async (req, res) => {
    try {
      const { email, password } = req.body;
        
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }
  
      // Check if user exists
      const user = await Employee.findOne({ Email:email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.Password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
  
      // Generate JWT
      const token = jwt.sign(
        { id: user._id, email: user.Email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.Password;
  
      // Return success response with token and basic user info
      res.status(200).json({
        message: "Login successful",
        token,
        user:userWithoutPassword
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };



module.exports = { SignUp , GenerateAndSendOtp , VerifyOtp , UpdateEmail , Signin };