const Employee = require('../../models/Employee.js');
const LeaveRequest = require('../../models/LeaveRequest.js');


exports.applyLeave = async (req, res) => {
    try {
        const { LeaveStartDate, LeaveEndDate, LeaveType, LeaveReason } = req.body;
        const employeeId = req.user.userId;

        // validate leave count
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        const totalDays = Math.ceil((new Date(LeaveEndDate) - new Date(LeaveStartDate)) / (1000 * 60 * 60 * 24)) + 1;
        if (totalDays > employee.LeaveInfo.RemainingLeaves) {
            return res.status(200).json({ success: false, message: "Insufficient remaining leaves" });
        }
 

        const newLeave = new LeaveRequest({
            EmployeeID: employeeId,
            LeaveStartDate,
            LeaveEndDate,
            LeaveType,
            LeaveReason,
            LeaveStatus: 'Pending'
        });

        await newLeave.save();

        // notification to employee

        // const employee = await Employee.findById(employeeId);
        // employee.Notifications.push({
        //     type: 'Leave',
        //     message: `Leave request submitted for ${LeaveType} from ${LeaveStartDate} to ${LeaveEndDate}`,
        //     date: Date.now(),
        //     status: 'Pending'
        // });
        // await employee.save();

        res.status(201).json({ message: 'Leave request submitted successfully' });

    } catch (error) {
        
    }
}

// when leave approved/rejected email notification to employee

// Get leave requests of this employee
exports.getMyLeaveRequests = async (req, res) => {
    try {
        const employeeId = req.user.userId;
        const leaves = await LeaveRequest.find({ EmployeeID: employeeId });
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching your leave requests", error: error.message });
    }
};



// Get all leave requests (for HR/Admin)
exports.getAllLeaveRequests = async (req, res) => {
    try {
        const leaves = await LeaveRequest.find().populate('EmployeeID', 'firstName lastName email department');
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching leave requests", error: error.message });
    }
};


// Approve Leave (by HR)
exports.approveLeave = async (req, res) => {
    try {
        const { leaveId } = req.params;

        const leave = await LeaveRequest.findById(leaveId);
        if (!leave) return res.status(404).json({ success: false, message: "Leave request not found" });

        if (leave.LeaveStatus !== "Pending")
            return res.status(400).json({ success: false, message: "This request has already been processed" });

        leave.LeaveStatus = 'Approved';
        await leave.save();

        // Update employee's leave info
        const employee = await Employee.findById(leave.EmployeeID);
        const totalDays = Math.ceil((new Date(leave.LeaveEndDate) - new Date(leave.LeaveStartDate)) / (1000 * 60 * 60 * 24)) + 1;

        employee.LeaveInfo.UsedLeaves += totalDays;
        employee.LeaveInfo.RemainingLeaves -= totalDays;

        await employee.save();
        
        res.status(200).json({ success: true, message: `Leave request approved` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating leave status", error: error.message });
    }
};

// Reject Leave (by HR)
exports.rejectLeave = async (req, res) => {
    try {
        const { leaveId } = req.params;

        const leave = await LeaveRequest.findById(leaveId);
        if (!leave) return res.status(404).json({ success: false, message: "Leave request not found" });

        if (leave.LeaveStatus !== "Pending")
            return res.status(400).json({ success: false, message: "This request has already been processed" });

        leave.LeaveStatus = 'Rejected';
        await leave.save();

        res.status(200).json({ success: true, message: `Leave request rejected` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating leave status", error: error.message });
    }
};