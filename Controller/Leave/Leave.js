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


// Approve Leave (by HR)
exports.approveLeave = async (req, res) => {
    try {
        const { leaveId } = req.params;

        const leave = await LeaveRequest.findById(leaveId);
        if (!leave) return res.status(404).json({ success: false, message: "Leave request not found" });

        if (leave.LeaveStatus !== LeaveStatus.PENDING)
            return res.status(200).json({ success: false, message: "This request has already been processed" });

        leave.LeaveStatus = LeaveStatus.APPROVED;
        await leave.save();

        // Update employee's leave info
        const employee = await Employee.findById(leave.EmployeeID);
        const totalDays = Math.ceil((new Date(leave.LeaveEndDate) - new Date(leave.LeaveStartDate)) / (1000 * 60 * 60 * 24)) + 1;

        let paidLeaveDays = 0;
        let unpaidLeaveDays = 0;

        if (employee.LeaveInfo.RemainingLeaves >= totalDays) {
            paidLeaveDays = totalDays;
            unpaidLeaveDays = 0;
        } else {
            paidLeaveDays = employee.LeaveInfo.RemainingLeaves;
            unpaidLeaveDays = totalDays - paidLeaveDays;
        }

        employee.LeaveInfo.UnpaidLeaves += unpaidLeaveDays;
        employee.LeaveInfo.RemainingLeaves -= paidLeaveDays;

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
        
        res.status(200).json({ success: true, message: `Leave request approved`, employee });
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

exports.resetLeaveBalanceOfAllEmployees = async (req, res) => { 
    try {
        const employees = await Employee.find({});
        for (const employee of employees) {
            employee.LeaveInfo.RemainingLeaves = 30; // Reset to 30 days
            employee.LeaveInfo.UnpaidLeaves = 0; // Reset unpaid leaves
            await employee.save();
        }
        res.status(200).json({ success: true, message: "Leave balance reset for all employees" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error resetting leave balance", error: error.message });
    }
}

exports.cancelLeaveRequest = async (req, res) => { 
    try {
        const { leaveId } = req.params;
        const employeeId = req.user.userId;

        const leave = await LeaveRequest.findOne({ _id: leaveId, EmployeeID: employeeId });
        if (!leave) return res.status(200).json({ success: false, message: "Leave request not found" });

        if (leave.LeaveStatus !== LeaveStatus.PENDING)
            return res.status(400).json({ success: false, message: "This request cannot be cancelled" });

        await LeaveRequest.deleteOne({ _id: leaveId });
        
        // notification to employee
        const notification = await sendNotification(
            [employeeId],
            "Leave Request Cancelled",
            `Your leave request from ${leave.LeaveStartDate} to ${leave.LeaveEndDate} of type ${leave.LeaveType} has been cancelled by you`,
            NotificationTypes.LEAVE_CANCELLED
        );

        res.status(200).json({ success: true, message: "Leave request cancelled successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error cancelling leave request", error: error.message });
    }
}

exports.employeeLeaveSummary = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(200).json({ success: false, message: "Employee not found" });

        const leaves = await LeaveRequest.find({ EmployeeID: employeeId });

        let sickCount = 0;
        let leavesToday = 0;
        let leavesThisMonth = 0;

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; // yyyy-mm-dd
        const currentMonth = today.getMonth(); // 0-11
        const currentYear = today.getFullYear();

        leaves.forEach((leave) => {
            const start = new Date(leave.LeaveStartDate);
            const isApproved = leave?.LeaveStatus === LeaveStatus.APPROVED;
      
            // Sick Leave Count
            if (
                leave?.LeaveType &&
                leave.LeaveType.toLowerCase() === LeaveTypes.SICK.toLowerCase() &&
                isApproved
            ) {
                const startDate = new Date(leave.LeaveStartDate);
                const endDate = new Date(leave.LeaveEndDate);
                const diffTime = endDate.getTime() - startDate.getTime();
                const days = Math.floor(diffTime / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
                sickCount += days;
            }
              
            
            // Leaves Applied for Today
            if (leave.LeaveApplyDate && new Date(leave.LeaveApplyDate).toISOString().split("T")[0] === todayStr) {
              leavesToday++;
            }
      
            // Leaves Taken in This Month
            if (start.getMonth() === currentMonth && start.getFullYear() === currentYear && isApproved) {
              leavesThisMonth++;
            }
          });
      
          const leaveSummary = {
            AnnualLeaves: employee?.LeaveInfo?.AnnualLeaves || 0,
            LeavesTaken: (employee?.LeaveInfo?.AnnualLeaves || 0) - (employee?.LeaveInfo?.RemainingLeaves || 0),
            UnpaidLeaves: employee?.LeaveInfo?.UnpaidLeaves || 0,
            SickLeaves: sickCount,
            LeaveRequests: leaves.length,
            LeavesAppliedToday: leavesToday,
            LeavesThisMonth: leavesThisMonth,
          };

        res.status(200).json({ success: true, leaveSummary });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching leave summary", error: error.message });
    }
}


// Get all pending leave requests (for HR/Admin) with employee details
exports.allPendingLeaves = async (req, res) => {
    try {
        const pendingLeaves = await LeaveRequest.find({ LeaveStatus: LeaveStatus.PENDING })
        .populate({
          path: "EmployeeID", // assuming the LeaveRequest model has a field EmployeeID
          select: "employeeCode name" // only bring these fields
        })
        .lean(); // make it plain JS object so we can easily add new fields
  
        // Add "days" field to each leave request
        const pendingLeavesWithDays = pendingLeaves.map(leave => {
            const start = leave.StartDate ? new Date(leave.StartDate) : null;
            const end = leave.EndDate ? new Date(leave.EndDate) : null;

            let diffDays = 1; // default to 1 day

            if (start && end) {
            const diffTime = end.getTime() - start.getTime();
            diffDays = diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 : 1; // +1 to include both start and end date
            } 
    
            return {
            ...leave,
            days: diffDays
            };
        });
  
      res.status(200).json({ success: true, pendingLeaves: pendingLeavesWithDays });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching pending leaves", error: error.message });
    }
  };
  

  exports.getLeaveRequestsSummaryForHR = async (req, res) => {
    try {
        const employeeId = req.user.userId;
        const leaves = await LeaveRequest.find({  });

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let leavesAppliedTodayCount = 0;
        let approvedLeavesThisMonthCount = 0;
        let pendingLeavesCount = 0;

        leaves.forEach(leave => {
            const startDate = new Date(leave.LeaveStartDate);

            // Applied today (ignoring status)
            if (
                startDate.getDate() === today.getDate() &&
                startDate.getMonth() === today.getMonth() &&
                startDate.getFullYear() === today.getFullYear()
            ) {
                leavesAppliedTodayCount++;
            }

            // Approved leaves this month
            if (
                leave.LeaveStatus === LeaveStatus.APPROVED &&
                startDate.getMonth() === currentMonth &&
                startDate.getFullYear() === currentYear
            ) {
                approvedLeavesThisMonthCount++;
            }

            // Pending leaves (regardless of date)
            if (leave.LeaveStatus === LeaveStatus.PENDING) {
                pendingLeavesCount++;
            }
        });

        res.status(200).json({
            success: true,
            leavesAppliedTodayCount,
            approvedLeavesThisMonthCount,
            pendingLeavesCount,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching leave statistics", error: error.message });
    }
}


exports.getAllLeavesOfMonth = async (req, res) => { 
    try {
        const leaveRequests = await LeaveRequest.find({
            LeaveStatus: { $in: [LeaveStatus.APPROVED, LeaveStatus.REJECTED] }
        })
            .populate('EmployeeID', 'name employeeCode') // Only populate the Name field from Employee
            .sort({ LeaveApplyDate: -1 });
        
        const formattedLeaves = leaveRequests.map(leave => {
            const startDate = new Date(leave.LeaveStartDate);
            const endDate = new Date(leave.LeaveEndDate);

            // Calculate no of days (including both start and end dates)
            const timeDiff = endDate.getTime() - startDate.getTime();
            const noOfDays = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

            return {
                fromDate: leave.LeaveStartDate,
                toDate: leave.LeaveEndDate,
                noOfDays: noOfDays,
                leaveType: leave.LeaveType,
                reason: leave.LeaveReason,
                status: leave.LeaveStatus,
                employeeName: leave.EmployeeID?.name || "Unknown",
                employeeCode: leave.EmployeeID?.employeeCode || "N/A",
            };
        });

        res.status(200).json({
            success: true,
            leaves: formattedLeaves
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching leaves", error: error.message });
    }
}
