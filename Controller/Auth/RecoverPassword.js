const express = require('express');
const crypto = require('crypto');
const Employee = require('../../models/Employee'); // Assuming you have a User model
const { sendEmail } = require('../../Utils/MailSetup');
const RecoveryTokens = require('../../models/RecoveryTokens');
const bcrypt = require("bcryptjs");


const generateAndSendVerificationLink = async (req, res) => {
    const { email } = req.body;

    try {
        // Generate a unique token
        const token = crypto.randomBytes(20).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // Link expires in 30 minutes

        // Find the user by email
        const user = await Employee.findOne({ Email: email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        
        const existingToken = await RecoveryTokens.findOne({ email: email });
        
        // Save the token and expiration time to the user document
        const recoveryToken = new RecoveryTokens({
            email,
            token,
            expiresAt,
        });

        if (existingToken) {
            existingToken.token = token;
            existingToken.expiresAt = expiresAt;
            await existingToken.save();
        } else {
            // Save the recovery token to the database
            await recoveryToken.save()
        }

        // Construct the recovery link
        const recoveryLink = `${process.env.RECOVERY_LINK}?token=${token}`;


        await sendEmail(email, 'Password Recovery Link', `Click the link below to recover your password (valid for 30 minutes):\n\n${recoveryLink}`); // Send the plain OTP, not the hashed one


        return res.status(200).json({ message: "Recovery link sent to your email" });
    } catch (error) {
        console.error("Error generating recovery link:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const verifyRecoveryToken = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: "Token is missing" });
    }

    try {
        // Find the recovery token by its value
        const recoveryToken = await RecoveryTokens.findOne({ token });

        if (!recoveryToken) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Check if the token has expired
        if (new Date() > recoveryToken.expiresAt) {
            return res.status(400).json({ message: "Token has expired" });
        }


        // If valid, allow the user to reset the password
        return res.status(200).json({ message: "Token is valid. You can now reset your password." });
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const resetPassword = async (req, res) => {
    const { email, password } = req.body;

    try {

        // Find the associated user by the token's email (or user ID)
        const user = await Employee.findOne({ Email: email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        user.Password = hashedPassword;
        await user.save();

        // Send success response
        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



module.exports = { generateAndSendVerificationLink, verifyRecoveryToken, resetPassword }