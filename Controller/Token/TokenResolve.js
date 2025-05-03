const Token = require("../../models/Token");
const Attendance = require("../../models/Attendance");
const { TokkenStatus, NotificationTypes } = require("../../utils/Enums");
const Employee = require("../../models/Employee");
const { sendNotification } = require("../Notifications/NotificationController");

const handleClockOutMissingToken = async (req, res) => {
    try {
        const { tokenId } = req.params;
        const { workEndTime } = req.body; // expected format: "HH:mm"


        const issue = await Token.findById(tokenId);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        const startOfDay = new Date(issue.IssueDate);
        const endOfDay = new Date(issue.IssueDate);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const attendance = await Attendance.findOne({
            ClockInTime: { $gte: startOfDay, $lt: endOfDay },
            EmployeeID: issue.EmployeeID
        });

        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found" });
        }

        const clockInTime = new Date(attendance.ClockInTime);

        // Parse "HH:mm" from workEndTime
        const [endHour, endMinute] = workEndTime.split(":").map(Number);
        const clockInDate = new Date(clockInTime); // For matching the date

        const endDateTime = new Date(clockInDate);
        endDateTime.setHours(endHour, endMinute, 0, 0); // Set time to the provided "workEndTime"

        // If workEndTime is earlier than clockInTime (e.g., cross-midnight), push to next day
        if (endDateTime < clockInTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }

        attendance.ClockOutTime = endDateTime;
        issue.Status = TokkenStatus.RESOLVED;

        const notification = await sendNotification(
            [issue.EmployeeID],
            "Ticket request Resolved",
            `Your ticket request for ${issue.Issue}\n Issue Type ${issue.IssueType}\n Raised on ${issue.RaisedDate} was resolved`,
            NotificationTypes.TICKET_REQUEST
        );

        await issue.save();
        await attendance.save();

        res.status(200).json({ message: "Clock out and work end time updated", attendance });
    } catch (error) {
        console.error("Error updating issue:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const handleTokenReject = async (req, res) => {
    try {
        const { tokenId } = req.params;

        // Find the issue by heading and issueDate
        const issue = await Token.findById(tokenId);

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        issue.Status = TokkenStatus.REJECTED

        issue.save()

        const notification = await sendNotification(
            [issue.EmployeeID],
            "Ticket request Rejected",
            `Your ticket request for ${issue.Issue}\n Issue Type ${issue.IssueType}\n Raised on ${issue.RaisedDate} was rejected`,
            NotificationTypes.TICKET_REQUEST
        );

        res.status(200).json({ message: "Token rejected sucessfully" });
    } catch (error) {
        console.error("Error updating issue:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const handleTokenResolve = async (req, res) => {
    try {
        const { tokenId } = req.params;

        // Find the issue by heading and issueDate
        const issue = await Token.findById(tokenId);

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        issue.Status = TokkenStatus.RESOLVED

        issue.save()

        const notification = await sendNotification(
            [issue.EmployeeID],
            "Ticket request Resolved",
            `Your ticket request for ${issue.Issue}\n Issue Type ${issue.IssueType}\n Raised on ${issue.RaisedDate} was resolved`,
            NotificationTypes.TICKET_REQUEST
        );

        res.status(200).json({ message: "Token rejected sucessfully" });
    } catch (error) {
        console.error("Error updating issue:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const assignTokenToManager = async (req, res) => {
    const { tokenId } = req.params;
    const { position, department } = req.body

    try {
        // 1. Find the token by ID
        const token = await Token.findById(tokenId);
        if (!token) {
            return res.status(404).json({ message: "Token not found" });
        }

        // 2. Find the employee by position and department
        const employee = await Employee.findOne({ position, department });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found with given position and department" });
        }

        // 3. Assign the token to the found employee
        token.AssignedTo = employee._id;
        token.Status = TokkenStatus.INPROGRESS
        await token.save();

        res.status(200).json({ message: "Token successfully assigned", token });
    } catch (error) {
        console.error("Error assigning token:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { handleClockOutMissingToken, handleTokenReject, handleTokenResolve };
