const Token = require("../../models/Token");
const Attendance = require("../../models/Attendance");
const { TokkenStatus } = require("../../utils/Enums");

const handleClockOutMissingToken = async (req, res) => {
    try {
        const { tokenId } = req.params;
        const {workEndTime} = req.body

        // Find the issue by heading and issueDate
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
            return res.status(404).json({ message: "Attendance not fund" });
        }

        const dateString = new Date(issue.IssueDate).toISOString().split("T")[0];
        attendance.ClockOutTime = new Date(`${dateString}T${workEndTime}:00`);
        issue.Status = TokkenStatus.RESOLVED

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

        res.status(200).json({ message: "Token rejected sucessfully" });
    } catch (error) {
        console.error("Error updating issue:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { handleClockOutMissingToken , handleTokenReject};
