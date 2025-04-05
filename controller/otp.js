const OTP = require("../models/OTP.js");

// Generate a 4-digit OTP
const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
};

// Send OTP email
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    throw new Error("Error sending OTP email");
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

    return res
      .status(200)
      .json({ message: "OTP sent successfully to your email" });
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
      return res
        .status(400)
        .json({ message: "OTP not found. Request a new one." });
    }

    // Check if OTP is expired
    if (Date.now() > existingOtp.expiresAt) {
      return res
        .status(400)
        .json({ message: "OTP expired. Request a new one." });
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


module.exports = { GenerateAndSendOtp, VerifyOtp };