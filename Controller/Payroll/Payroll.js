const Employee = require('../../models/Employee');
const moment = require('moment');
const Attendance = require('../../models/Attendance');
const LeaveRequest = require('../../models/LeaveRequest');
const { LeaveTypes } = require('../../utils/Enums');
const Payroll = require('../../models/Payroll');

const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    const current = moment(startDate);
    while (current <= endDate) {
        dates.push(moment(current));
        current.add(1, 'days');
    }
    return dates;
};


exports.generatePayslip = async (req, res) => {
    try {
        const { EmployeeID, Month, Year } = req.body;

        // Check if employee exists
        const employee = await Employee.findById(EmployeeID).populate('companyID');
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Check if payroll already exists
        const existingPayroll = await Payroll.findOne({ EmployeeID, Month, Year });
        if (existingPayroll) {
            return res.status(200).json({ success: false, message: 'Payroll already exists', existingPayroll });
        }

        // Extract and split work timings string
        const [timings] = employee.companyID.workTimings; // e.g., "09:00 - 18:00"
        const [startTimeStr, endTimeStr] = timings.split(' - ').map(t => t.trim());

        const workStart = moment(startTimeStr, "HH:mm");
        const workEnd = moment(endTimeStr, "HH:mm");
        const workDuration = moment.duration(workEnd.diff(workStart)).asHours();


        // Get all attendance records for this employee in this month
        const startOfMonth = moment(`${Year}-${Month}-01`).startOf('month');
        const endOfMonth = moment(startOfMonth).endOf('month');
        const attendances = await Attendance.find({
            EmployeeID,
            ClockInTime: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
            ClockOutTime: { $ne: null }
        });

        // Calculate total overtime hours
        let totalOvertimeHours = 0;
        attendances.forEach(att => {
            const clockIn = moment(att.ClockInTime);
            const clockOut = moment(att.ClockOutTime);
            const actualHours = moment.duration(clockOut.diff(clockIn)).asHours();
            const overtime = Math.max(0, actualHours - workDuration);
            totalOvertimeHours += overtime;
        });


        // Overtime pay = 0.5% of salary per hour
        const salary = parseFloat(employee.salary) || 0;
        const ratePerHour = 0.005 * salary;
        const overtimePay = totalOvertimeHours * ratePerHour;


        // Fetch leave data
        const leaves = await LeaveRequest.find({
            EmployeeID,
            LeaveStartDate: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() }
        });

        const leaveCounts = {
            Sick: 0,
            Casual: 0,
            Annual: employee.LeaveInfo.RemainingLeaves
        };
        leaves.forEach(leave => {
            if (leave.LeaveType === LeaveTypes.SICK) leaveCounts.Sick++;
            else if (leave.LeaveType === LeaveTypes.CASUAL) leaveCounts.Casual++;
        });


        const attendanceDates = attendances.map(a => moment(a.ClockInTime).format('YYYY-MM-DD'));
        const leaveDates = leaves.map(l => moment(l.LeaveStartDate).format('YYYY-MM-DD'));

        const datesInMonth = getDatesInRange(startOfMonth, endOfMonth);
        let absentCount = 0;

        datesInMonth.forEach(date => {
            const dateStr = date.format('YYYY-MM-DD');
            const isWeekend = date.day() === 0 || date.day() === 6;     // Sunday = 0, Saturday = 6

            if (
                !isWeekend &&
                !attendanceDates.includes(dateStr) &&
                !leaveDates.includes(dateStr)
            ) {
                absentCount++;
            }
        });

        // Absent deduction
        const absentFine = absentCount * 1000;


        // Update total PF fund
        employee.PR_FundTotal += employee.PF_FundPerMonth * 2;
        await employee.save();

        // Create payroll record
        const payroll = new Payroll({
            EmployeeID,
            Month,
            Year,
            Deductions: {
                Tax: 2500,
                PF_Funds: employee.PF_FundPerMonth,
                Absents: absentCount,
                AbsentsFine: absentFine,
                Other: 0
            },
            Allowances: {
                Utilities: 2000,
                BasicSalary: employee.salary,
                MedicalExpenses: 5000,
                Fuel: 2000,
                OvertimePay: overtimePay,
                OvertimeHours: totalOvertimeHours,
                Other: 0
            },
            Contributions: {
                EmployeePF_Fund: employee.PR_FundTotal,
                EmployerPF_Fund: employee.PR_FundTotal
            },            
            Leaves: leaveCounts
        });

        await payroll.save();

        res.status(201).json({
            success: true,
            message: 'Payroll record created successfully',
            payroll,
            leaves: leaveCounts,
            totalOvertimeHours,
            overtimePay,
            absentCount,
            absentFine,
            pfUpdatedTo: employee.PR_FundTotal
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getMyPayroll = async (req, res) => { 
    try {
        const { Month, Year } = req.body;
        const EmployeeID = req.user.userId;

        // Check if employee exists
        const employee = await Employee.findById(EmployeeID);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Fetch payroll data
        const payroll = await Payroll.findOne({ EmployeeID, Month, Year });
        if (!payroll) {
            return res.status(404).json({ success: false, message: 'Payroll record not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Payroll record fetched successfully',
            payroll
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getAllPayrolls = async (req, res) => {
    try {
        const EmployeeID = req.user.userId;

        // Check if employee exists
        const employee = await Employee.findById(EmployeeID);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Fetch all payroll data for the employee
        const payrolls = await Payroll.find({ EmployeeID });

        res.status(200).json({
            success: true,
            message: 'All payroll records fetched successfully',
            payrolls
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.getPayroll = async (req, res) => {
    try {
        const { employeeId, year, month } = req.params;
        console.log(employeeId, year, month)

        // Check if employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Validate month and year
        if (!moment(`${year}-${month}-01`, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({ success: false, message: 'Invalid month or year' });
        }

        // Fetch payroll data by ID
        const payroll = await Payroll.findOne({EmployeeID: employeeId, Year: year, Month: month});
        if (!payroll) {
            return res.status(200).json({ success: false, message: 'Payroll record not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Payroll record fetched successfully',
            payroll
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}