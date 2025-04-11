const Employee = require('../../models/Employee.js');
const LeaveRequest = require('../../models/LeaveRequest.js');
const { LeaveStatus, LeaveTypes, NotificationTypes } = require('../../utils/Enums.js');
const { sendNotification } = require('../../Controller/Notifications/NotificationController.js');
const { sendEmail } = require('../../utils/MailSetup.js'); 
const { sendLeaveRequestMail, sendLeaveApprovalMail, sendLeaveRejectionMail } = require('../../utils/MailTemplates.js');


exports.applyLeave = async (req, res) => {
    try {
        const { LeaveStartDate, LeaveEndDate, LeaveType, LeaveReason } = req.body;
        const employeeId = req.user.userId;

        if (!LeaveStartDate || !LeaveEndDate || !LeaveType || !LeaveReason) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        // check if leave dates are valid
        const startDate = new Date(LeaveStartDate);
        const endDate = new Date(LeaveEndDate);
        if (startDate > endDate) {
            return res.status(200).json({ success: false, message: "Start date cannot be after end date" });
        }
        if (startDate < new Date()) {
            return res.status(200).json({ success: false, message: "Leave start date cannot be in the past" });
        }
        if (endDate < new Date()) {
            return res.status(200).json({ success: false, message: "Leave end date cannot be in the past" });
        }
        // check if leave type is valid
        if (!Object.values(LeaveTypes).includes(LeaveType)) {
            return res.status(200).json({ success: false, message: "Invalid leave type" });
        }

        // validate leave count
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        const totalDays = Math.ceil((new Date(LeaveEndDate) - new Date(LeaveStartDate)) / (1000 * 60 * 60 * 24)) + 1;
        if (totalDays > employee.LeaveInfo.RemainingLeaves) {
            return res.status(200).json({ success: false, message: "Insufficient remaining leaves" });
        }

        const newLeave = new LeaveRequest({
            EmployeeID: employeeId, LeaveStartDate, LeaveEndDate,
            LeaveType, LeaveReason, LeaveStatus: LeaveStatus.PENDING
        });

        await newLeave.save();

        // notification to employee
        const notification = await sendNotification(
            [employeeId],
            "Leave Request Submitted",
            `Leave request submitted successfully for ${LeaveStartDate} to ${LeaveEndDate} for type ${LeaveType}`,
            NotificationTypes.LEAVE_REQUEST
        );

        // send mail to self of leave request
        await sendEmail(employee.email, "Leave Request Submitted", sendLeaveRequestMail({
            name: `${employee.firstName} ${employee.lastName}`,
            leaveType: LeaveType,
            leaveReason: LeaveReason,
            startDate: LeaveStartDate,
            endDate: LeaveEndDate
        }));

        res.status(201).json({ success: true, message: 'Leave request submitted successfully', newLeave});
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error applying for leave", error: error.message });
    }
}

// Get leave requests of this employee
exports.getMyLeaveRequests = async (req, res) => {
    try {
        const employeeId = req.user.userId;
        const leaves = await LeaveRequest.find({ EmployeeID: employeeId });
        res.status(200).json({ success: true, leaves: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching your leave requests", error: error.message });
    }
};



// Get all leave requests (for HR/Admin)
exports.getAllLeaveRequests = async (req, res) => {
    try {
        const leaves = await LeaveRequest.find().populate('EmployeeID', 'firstName lastName email department');
        res.status(200).json({ success: true, leaves: leaves });
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

        if (leave.LeaveStatus !== LeaveStatus.PENDING)
            return res.status(400).json({ success: false, message: "This request has already been processed" });

        leave.LeaveStatus = LeaveStatus.APPROVED;
        await leave.save();

        // Update employee's leave info
        const employee = await Employee.findById(leave.EmployeeID);
        const totalDays = Math.ceil((new Date(leave.LeaveEndDate) - new Date(leave.LeaveStartDate)) / (1000 * 60 * 60 * 24)) + 1;

        employee.LeaveInfo.UsedLeaves += totalDays;
        employee.LeaveInfo.RemainingLeaves -= totalDays;

        await employee.save();

        // notification to employee
        const notification = await sendNotification(
            [leave.EmployeeID],
            "Leave Request Approved",
            `Your leave request from ${leave.LeaveStartDate} to ${leave.LeaveEndDate} of type ${leave.LeaveType} has been approved`,
            NotificationTypes.LEAVE_APPROVED
        );

        // send mail to employee of leave request approved
        await sendEmail(employee.email, "Leave Request Approved", sendLeaveApprovalMail({
            name: `${employee.firstName} ${employee.lastName}`,
            leaveType: leave.LeaveType,
            startDate: leave.LeaveStartDate,
            endDate: leave.LeaveEndDate
        }));
        
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

        if (leave.LeaveStatus !== LeaveStatus.PENDING)
            return res.status(400).json({ success: false, message: "This request has already been processed" });

        const employee = await Employee.findById(leave.EmployeeID);
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        leave.LeaveStatus = LeaveStatus.REJECTED;
        await leave.save();

        // Notification to employee
        const notification = await sendNotification(
            [leave.EmployeeID],
            "Leave Request Rejected",
            `Your leave request from ${leave.LeaveStartDate} to ${leave.LeaveEndDate} of type ${leave.LeaveType} has been rejected`,
            NotificationTypes.LEAVE_REJECTED
        );

        // Send mail to employee of leave request rejected
        await sendEmail(employee.email, "Leave Request Rejected", sendLeaveRejectionMail({
            name: `${employee.firstName} ${employee.lastName}`,
            leaveType: leave.LeaveType,
            startDate: leave.LeaveStartDate,
            endDate: leave.LeaveEndDate,
            reason: leave.LeaveReason
        }));

        res.status(200).json({ success: true, message: `Leave request rejected` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating leave status", error: error.message });
    }
};