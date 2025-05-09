const mongoose = require('mongoose');
const Token = require("../../models/Token");
const Employee = require("../../models/Employee"); // Assuming you have an Employee model
const { IssueTypes, TokkenStatus, NotificationTypes } = require('../../utils/Enums')
const { sendNotification } = require('../../Controller/Notifications/NotificationController.js');

const createToken = async (req, res) => {
    const { EmployeeID } = req.params;
    const { IssueType, Description, Issue, IssueDate } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(EmployeeID)) {
        return res.status(400).json({ message: 'Invalid EmployeeID' });
    }

    // Check if employee exists
    const employeeExists = await Employee.findById(EmployeeID);
    if (!employeeExists) {
        return res.status(404).json({ message: 'Employee not found' });
    }

    // Validate required fields
    if (!IssueType || !Description || !Issue) {
        return res.status(400).json({ message: 'IssueType, Description, and issue fields are required' });
    }

    // Validate IssueType enum
    const validIssueTypes = [IssueTypes.PERSONAL, IssueTypes.ATTENDANCE, IssueTypes.SOFTWARE, IssueTypes.HARDWARE, IssueTypes.NETWORK, IssueTypes.OTHER];
    if (!validIssueTypes.includes(IssueType)) {
        return res.status(400).json({ message: `Invalid IssueType. Valid options are: ${validIssueTypes.join(', ')}` });
    }

    try {
        const newToken = new Token({
            EmployeeID,
            IssueType,
            Description,
            Issue,
            IssueDate,
            RaisedDate: new Date(),
            Status: TokkenStatus.OPEN,
        });

        await newToken.save();

        const employees = await Employee.find({ userRole: 'hr' }).select('_id');

        const hrIds = employees.map(emp => emp._id);


        // Process employees here if found


        const notification = await sendNotification(
            [EmployeeID],
            "New Ticket Request Submitted",
            `Your ticket request submitted successfully for ${Issue}\n Issue Type ${IssueType}\n Raised on ${newToken.RaisedDate}`,
            NotificationTypes.TICKET_REQUEST
        );


        const notificationforHr = await sendNotification(
            hrIds,
            "New Ticket Request",
            `A ticket request submitted from ${employeeExists.firstName} ${employeeExists.lastName}\n Employee code: ${employeeExists.employeeCode}\n Issue: ${Issue}\n Issue Type: ${IssueType}\n Raised on ${newToken.RaisedDate}`,
            NotificationTypes.TICKET_REQUEST
        );


        res.status(201).json(newToken);
    } catch (err) {
        console.error('Error creating token:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


const getEmployeeTokens = async (req, res) => {
    const { EmployeeID } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(EmployeeID)) {
        return res.status(400).json({ error: 'Invalid employee ID' });
    }

    try {
        const tokens = await Token.find({ EmployeeID: EmployeeID });
        res.status(200).json({ tokensData: tokens });
    } catch (err) {
        console.error('Error fetching employee tokens:', err);
        res.status(500).json({ error: 'Server error' });
    }
};



const getAllTokens = async (req, res) => {
    const { companyId } = req.params; // /tokens/:companyId


    try {
        const tokens = await Token.find()
            .populate('EmployeeID', 'firstName lastName companyID employeeCode');

        const filteredTokens = tokens.filter(token =>
            token.EmployeeID &&
            token.EmployeeID.companyID &&
            token.EmployeeID.companyID.equals(companyId)
        );



        res.status(200).json({ tokens: filteredTokens });
    } catch (err) {
        console.error('Error fetching employee tokens:', err);
        res.status(500).json({ error: 'Server error' });
    }
};




module.exports = {
    createToken, getEmployeeTokens, getAllTokens
};
