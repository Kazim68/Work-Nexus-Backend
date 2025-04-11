const Employee = require('../../models/Employee');
const { UserRoles, Departments } = require('../../utils/Enums.js');

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
  
      const employee = new Employee({ userRole, firstName, lastName, name, 
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




module.exports = {updateEmail, increaseLeaveBalance, getAllEmployees, createEmployee};