const Employee = require('../../models/Employee')



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




module.exports = {updateEmail, increaseLeaveBalance};