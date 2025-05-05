const Employee = require('../../models/Employee');
const { UserRoles, Departments } = require('../../utils/Enums.js');
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const generatePassword = require('../../utils/GeneratePasswprd.js');
const excelDateToJS = require('../../utils/ExcelDateFormat.js');

// get all employees
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({});
        res.status(200).json({ success: true, data: employees });
    } catch (error) {
        console.error("Error fetching all employees:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}


// create employee
const createEmployee = async (req, res) => {
    try {
        const {
            firstName, lastName, name, dateOfBirth, gender,
            address, phoneNumber, email, hireDate, department,
        } = req.body;

        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(200).json({ success: false, message: 'Employee already exists with this email' });
        }

        //const password = Math.random().toString(36).slice(-8); // Random 8 character password
        const password = 'test123'; // Default password for testing

        const dob = new Date(dateOfBirth);
        const hDate = new Date(hireDate);
        const isMale = gender.toLowerCase() === 'male';
        const userRole = UserRoles.EMPLOYEE;

        if (!Object.values(Departments).includes(department)) {
            return res.status(200).json({ success: false, message: 'Invalid department' });
        }

        const employee = new Employee({
            userRole, firstName, lastName, name,
            dateOfBirth: dob, gender: isMale,
            address, phoneNumber, email, password,
            hireDate: hDate, department
        });

        await employee.save();

        res.status(201).json({ success: true, message: 'Employee created successfully', employee, password });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


//Bulk employee onboarding
const bulkUpload = async (req, res) => {
    const { companyId } = req.params;
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const credentials = [];
    for (const row of data) {
        const password = generatePassword();

        const employee = new Employee({
            firstName: row.First_Name,
            lastName: row.Last_Name,
            dateOfBirth: excelDateToJS(row.DateOfBirth),
            gender: row.Gender.toLowerCase() === 'male',
            address: row.Address,
            phoneNumber: row.Phone_Number,
            email: row.Email,
            hireDate: excelDateToJS(row.HireDate),
            user_role: row.Role,
            employeeCode: row.Employee_Code,
            department: row.Department,
            position:row.Designation,
            salary:row.Salary,

            companyID: companyId,
            isVerified: true,
            status: 'active',
            password,
        });

        await employee.save();
        credentials.push({ email: row.email, password });
    }

    const baseDir = path.join(__dirname, '..', '..', 'Uploads', 'Company', 'downloads');
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }

    const newWorkbook = xlsx.utils.book_new();
    const newSheet = xlsx.utils.json_to_sheet(credentials);
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Credentials");

    const fileName = `${uuidv4()}.xlsx`;
    const outputPath = path.join(baseDir, fileName);
    xlsx.writeFile(newWorkbook, outputPath);

    res.download(outputPath, () => {
        fs.unlinkSync(req.file.path);
        fs.unlinkSync(outputPath);
    });
};


//UPDATE EMAIL
const updateEmail = async (req, res) => {
    const { oldEmail } = req.params;
    const { newEmail } = req.body;

    if (!newEmail) {
        return res.status(400).json({ success: false, message: 'New email is required' });
    }

    try {
        const user = await Employee.findOne({ email: oldEmail });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with the given email' });
        }

        // Check if new email is already taken by someone else
        const emailExists = await Employee.findOne({ email: newEmail });
        if (emailExists) {
            return res.status(409).json({ success: false, message: 'This email is already in use' });
        }

        user.email = newEmail;
        await user.save();

        res.status(200).json({ success: true, message: 'Email updated successfully', email: newEmail });
    } catch (err) {
        console.error("Update Email Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// increase employee leave balance
const increaseLeaveBalance = async (req, res) => {
    const { employeeId, leaveDays } = req.body;
    if (!employeeId || !leaveDays) {
        return res.status(400).json({ success: false, message: 'Employee ID and leave days are required' });
    }

    try {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        employee.LeaveInfo.RemainingLeaves += leaveDays;
        await employee.save();

        return res.status(200).json({
            success: true,
            message: `Leave balance increased by ${leaveDays} days for employee ${employeeId}`,
            remainingLeaves: employee.LeaveInfo.RemainingLeaves
        });
    } catch (error) {
        console.error("Error increasing leave balance:", error);
        return res.status(500).json({
            success: false,
            message: error.message || 'An error occurred while increasing leave balance'
        });
    }
};


// Reset Password
const changePassword = async (req, res) => {
    const { newPassword } = req.body;
    const employeeId = req.user.userId;

    if (!newPassword) {
        return res.status(400).json({ success: false, message: 'Employee ID and new password are required.' });
    }

    try {
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found.' });
        }

        employee.password = newPassword;
        await employee.save();

        return res.status(200).json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ success: false, message: 'Server error while resetting password.' });
    }
};



module.exports = { updateEmail, increaseLeaveBalance, getAllEmployees, createEmployee, bulkUpload, changePassword };