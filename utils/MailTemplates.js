exports.sendLeaveRequestMail = ({ name, leaveType, leaveReason, startDate, endDate }) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f3e0c0; border-radius: 10px; background-color: #fffdf5;">
            <h2 style="color: #FFA500; margin-bottom: 20px;">Leave Request Submitted</h2>

            <p>Hi <strong>${name}</strong>,</p>

            <p>Your leave request has been successfully submitted. Here are the details:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #f3e0c0; background-color: #fff8e1;"><strong>Leave Type</strong></td>
                    <td style="padding: 10px; border: 1px solid #f3e0c0;">${leaveType}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #f3e0c0; background-color: #fff8e1;"><strong>Start Date</strong></td>
                    <td style="padding: 10px; border: 1px solid #f3e0c0;">${startDate}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #f3e0c0; background-color: #fff8e1;"><strong>End Date</strong></td>
                    <td style="padding: 10px; border: 1px solid #f3e0c0;">${endDate}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #f3e0c0; background-color: #fff8e1;"><strong>Reason</strong></td>
                    <td style="padding: 10px; border: 1px solid #f3e0c0;">${leaveReason}</td>
                </tr>
            </table>

            <p style="margin-top: 20px;">We will notify you once your request is approved or rejected.</p>

            <p style="color: #888;">Thanks,<br />Work Nexus Team</p>
        </div>
    `;
};

exports.sendLeaveApprovalMail = ({ name, leaveType, startDate, endDate }) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #d2f0d2; border-radius: 10px; background-color: #f9fff9;">
            <h2 style="color: #28a745; margin-bottom: 20px;">Leave Request Approved</h2>

            <p>Hi <strong>${name}</strong>,</p>

            <p>Great news! Your leave request has been <strong>approved</strong>. Here are the details:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #e2f9e2; background-color: #eaffea;"><strong>Leave Type</strong></td>
                    <td style="padding: 10px; border: 1px solid #e2f9e2;">${leaveType}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e2f9e2; background-color: #eaffea;"><strong>Start Date</strong></td>
                    <td style="padding: 10px; border: 1px solid #e2f9e2;">${startDate}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e2f9e2; background-color: #eaffea;"><strong>End Date</strong></td>
                    <td style="padding: 10px; border: 1px solid #e2f9e2;">${endDate}</td>
                </tr>
            </table>

            <p style="margin-top: 20px;">Enjoy your time off! Please ensure all your responsibilities are managed before leaving.</p>

            <p style="color: #888;">Thanks,<br />Work Nexus Team</p>
        </div>
    `;
};

exports.sendLeaveRejectionMail = ({ name, leaveType, startDate, endDate, reason }) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f5d4d4; border-radius: 10px; background-color: #fff8f8;">
            <h2 style="color: #dc3545; margin-bottom: 20px;">Leave Request Rejected</h2>

            <p>Hi <strong>${name}</strong>,</p>

            <p>We regret to inform you that your leave request has been <strong>rejected</strong>. Below are the details of your request:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #f5d4d4; background-color: #ffe5e5;"><strong>Leave Type</strong></td>
                    <td style="padding: 10px; border: 1px solid #f5d4d4;">${leaveType}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #f5d4d4; background-color: #ffe5e5;"><strong>Start Date</strong></td>
                    <td style="padding: 10px; border: 1px solid #f5d4d4;">${startDate}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #f5d4d4; background-color: #ffe5e5;"><strong>End Date</strong></td>
                    <td style="padding: 10px; border: 1px solid #f5d4d4;">${endDate}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #f5d4d4; background-color: #ffe5e5;"><strong>Reason</strong></td>
                    <td style="padding: 10px; border: 1px solid #f5d4d4;">${reason || "Not specified"}</td>
                </tr>
            </table>

            <p style="margin-top: 20px;">If you have any questions or concerns, feel free to reach out to your supervisor or HR department.</p>

            <p style="color: #888;">Thanks,<br />Work Nexus Team</p>
        </div>
    `;
};
