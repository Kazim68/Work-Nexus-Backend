const Employee = require('../../models/Employee')
const customError = require('../../Utils/Error')
const bcrypt = require("bcryptjs");


const signUp = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        const nameArray = fullName.split(" "); // Split by space

        // First part of the name is the first name, and the rest is the last name
        const firstName = nameArray[0];
        const lastName = nameArray.slice(1).join(" ");

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


module.exports = { signUp };