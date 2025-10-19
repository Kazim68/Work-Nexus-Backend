const Attendance = require("../../models/Attendance");
const Employee = require("../../models/Employee");
const moment = require('moment');

// Clock In Controller
const clockIn = async (req, res) => {
    console.log("clockIn function called");
    const { employeeId } = req.params;
    const { clockInTime } = req.body;

    console.log("Validating clockInTime");
    if (!clockInTime || isNaN(new Date(clockInTime).getTime())) {
        return res.status(400).json({ success: false, message: 'ClockInTime must be a valid Date' });
    }


    try {
        console.log("Finding employee:", employeeId);
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            console.log("Employee not found");
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight

        console.log("Checking for existing clock-in today");
        const existingAttendance = await Attendance.findOne({
            EmployeeID: employeeId,
            ClockInTime: { $gte: today }
        });

        if (existingAttendance) {
            console.log("Employee has already clocked in today");
            return res.status(400).json({ success: false, message: 'You have already clocked in today' });
        }

        console.log("Creating new attendance record");
        const newAttendance = new Attendance({
            EmployeeID: employeeId,
            ClockInTime: clockInTime
        });

        await newAttendance.save();
        console.log("Clock-in recorded successfully");
        res.status(201).json({ success: true, message: 'Clock-in recorded', data: newAttendance });
    } catch (error) {
        console.error('Clock-in error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Clock Out Controller
const clockOut = async (req, res) => {
    console.log("clockOut function called");
    const { employeeId } = req.params;
    const { clockOutTime } = req.body;

    console.log("Validating clockOutTime");
    if (!clockOutTime || isNaN(new Date(clockOutTime).getTime())) {
        return res.status(400).json({ success: false, message: 'clockOutTime must be a valid Date' });
    }

    try {
        console.log("Finding employee:", employeeId);
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            console.log("Employee not found");
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log("Finding clock-in record for today");
        const attendance = await Attendance.findOne({
            EmployeeID: employeeId,
            ClockInTime: { $gte: today }
        });

        if (!attendance) {
            console.log("No clock-in record found for today");
            return res.status(404).json({ success: false, message: 'No clock-in record found for today' });
        }

        if (attendance.ClockOutTime) {
            console.log("Employee has already clocked out today");
            return res.status(400).json({ success: false, message: 'You have already clocked out today' });
        }

        if (clockOutTime <= attendance.ClockInTime) {
            console.log("Clock-out time must be after clock-in time");
            return res.status(400).json({ success: false, message: 'ClockOutTime must be after ClockInTime' });
        }

        console.log("Updating clock-out time");
        attendance.ClockOutTime = clockOutTime;
        await attendance.save();

        console.log("Clock-out recorded successfully");
        res.status(200).json({ success: true, message: 'Clock-out recorded', data: attendance });
    } catch (error) {
        console.error('Clock-out error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


function msToDecimalHours(ms) {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const decimalHours = totalMinutes / 60;
    return parseFloat(decimalHours.toFixed(2));
}


const getAttendanceSummary = async (req, res) => {
    console.log("getAttendanceSummary function called");
    const { employeeId } = req.params;

    try {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        console.log("Fetching current month attendance records");
        const currentMonthRecords = await Attendance.find({
            EmployeeID: employeeId,
            ClockInTime: { $gte: startOfCurrentMonth }
        });

        console.log("Fetching previous month attendance records");
        const previousMonthRecords = await Attendance.find({
            EmployeeID: employeeId,
            ClockInTime: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth }
        });

        // Today's record
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        console.log("Fetching today's attendance record");
        const todayRecord = await Attendance.findOne({
            EmployeeID: employeeId,
            ClockInTime: { $gte: todayStart, $lt: todayEnd }
        });

        // Converts milliseconds to decimal hours
        const msToDecimalHours = (ms) => {
            const totalMinutes = Math.floor(ms / 60000);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const decimalMinutes = Math.round((minutes / 60) * 100) / 100;
            return parseFloat((hours + decimalMinutes).toFixed(2));
        };

        const processRecords = (records) => {
            console.log("Processing attendance records");
            const durations = {};
            const details = {};
            const nullClockOuts = {};

            records.forEach(record => {
                const day = record.ClockInTime.getDate();
                const hasClockOut = !!record.ClockOutTime;

                // Calculate duration if clockOut exists
                const durationMs = hasClockOut
                    ? new Date(record.ClockOutTime) - new Date(record.ClockInTime)
                    : 0;

                // Sum up duration for the day
                if (!durations[day]) durations[day] = 0;
                durations[day] += durationMs;

                // Save full record detail
                details[day] = {
                    clockInTime: record.ClockInTime.toISOString(),
                    clockOutTime: hasClockOut ? record.ClockOutTime.toISOString() : null
                };

                // Track separately if clockOut is missing
                if (!hasClockOut) {
                    nullClockOuts[day] = {
                        clockInTime: record.ClockInTime.toISOString(),
                        clockOutTime: null
                    };
                }
            });

            // Convert durations to decimal hours
            const formattedDurations = {};
            for (const [day, totalMs] of Object.entries(durations)) {
                formattedDurations[day] = msToDecimalHours(totalMs);
            }

            return { durations: formattedDurations, details, nullClockOuts };
        };

        // Process records
        console.log("Processing current month records");
        const {
            durations: currentMonth,
            details: currentMonthDetails,
            nullClockOuts: nullClockOutsCurrentMonth
        } = processRecords(currentMonthRecords);

        console.log("Processing previous month records");
        const {
            durations: previousMonth,
            details: previousMonthDetails,
            nullClockOuts: nullClockOutsPreviousMonth
        } = processRecords(previousMonthRecords);

        // Format today's attendance
        let today = null;
        if (todayRecord?.ClockInTime || todayRecord?.ClockOutTime) {
            today = {
                clockInTime: todayRecord.ClockInTime?.toISOString() || null,
                clockOutTime: todayRecord.ClockOutTime?.toISOString() || null
            };
        }

        // Send response
        console.log("Sending attendance summary response");
        return res.json({
            currentMonth,
            currentMonthDetails,
            previousMonth,
            previousMonthDetails,
            nullClockOuts: {
                currentMonth: nullClockOutsCurrentMonth,
                previousMonth: nullClockOutsPreviousMonth
            },
            today
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};


function getWeekNumber(date) {
    const startOfMonth = moment(date).startOf('month');
    return Math.ceil(moment(date).diff(startOfMonth, 'days') / 7) + 1;
}



const getweeklyAttendance =  async (req, res) => {
    console.log("getweeklyAttendance function called");
    try {
        const { employeeId } = req.params;

        console.log("Fetching attendance for employee:", employeeId);
        const attendances = await Attendance.find({ EmployeeID: employeeId });

        const weeks = {};

        console.log("Calculating weekly attendance");
        attendances.forEach(record => {
            if (record.ClockInTime && record.ClockOutTime) {
                const weekNum = getWeekNumber(record.ClockInTime);

                if (!weeks[weekNum]) {
                    weeks[weekNum] = {
                        totalWorkedSeconds: 0,
                        daysCount: 0,
                    };
                }

                const duration = (new Date(record.ClockOutTime) - new Date(record.ClockInTime)) / 1000; // in seconds
                weeks[weekNum].totalWorkedSeconds += duration;
                weeks[weekNum].daysCount += 1;
            }
        });

        const summary = [];
        const scheduledSecondsPerWeek = 40 * 3600; // 40 hours

        for (let week = 1; week <= 5; week++) {
            const workedSeconds = weeks[week]?.totalWorkedSeconds || 0;
            const averageSeconds = weeks[week]?.daysCount ? workedSeconds / weeks[week].daysCount : 0;

            summary.push({
                week: `Week ${week}`,
                scheduledHours: new Date(scheduledSecondsPerWeek * 1000).toISOString().substr(11, 8),
                workedHours: new Date(workedSeconds * 1000).toISOString().substr(11, 8),
                averageHours: new Date(averageSeconds * 1000).toISOString().substr(11, 8),
            });
        }

        console.log("Sending weekly attendance summary response");
        res.json({data : summary});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};





module.exports = { clockIn, clockOut, getAttendanceSummary , getweeklyAttendance }