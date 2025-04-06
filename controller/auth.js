const Employee = require("../models/Employee");
const customError = require("../Utils/Error");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");

exports.signUp = async (req, res, next) => {
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
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Create new employee
    const newEmployee = new Employee({
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: password,
    });

    await newEmployee.save();

    // Generate a JWT token
    const token = user.createJWT();

    res
      .status(201)
      .json({
        success: true,
        message: "Employee registered successfully",
        token,
      });
  } catch (error) {
    next(error); // Pass error to middleware
  }
};


exports.updateEmail = async (req, res) => {
  const { oldEmail } = req.params;
  const { newEmail } = req.body;

  if (!newEmail) {
    return res
      .status(400)
      .json({ success: false, message: "New email is required" });
  }

  try {
    const user = await Employee.findOne({ Email: oldEmail });

    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          message: "User not found with the given email",
        });
    }

    user.Email = newEmail;
    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Email updated successfully",
        email: newEmail,
      });
  } catch (err) {
    console.error("Update Email Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Check if user exists
    const user = await Employee.findOne({ Email: email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check password
    // const isMatch = await bcrypt.compare(password, user.Password);  
    const isMatch = await Employee.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT
    // const token = jwt.sign(
    //   { id: user._id, email: user.Email },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "7d" }
      // );
    const token = user.createJWT()

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.Password;

    // Return success response with token and basic user info
    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
