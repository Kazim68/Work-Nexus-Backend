const Notification = require('../../models/Notification.js');

exports.getNotifications = async (req, res) => {
    try {
        const employeeId = req.user.userId;

        // Pagination setup
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalNotifications = await Notification.countDocuments({ recipients: employeeId });

        const notificationsRaw = await Notification.find({ recipients: employeeId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        // add a flag in each notification that read by employee or not
        const notifications = notificationsRaw.map(notification => ({
            ...notification,
            isRead: (notification.readBy || []).map(id => id.toString()).includes(employeeId.toString())
        }));
        

        res.status(200).json({
            success: true,
            notifications,
            pagination: {
                total: totalNotifications,
                page,
                limit,
                totalPages: Math.ceil(totalNotifications / limit),
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching notifications", error: error.message });
    }
};


exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const employeeId = req.user.userId;

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(200).json({ success: false, message: "Notification not found" });
        }

        // Check if the employee is a recipient
        if (
            Array.isArray(notification.recipients) &&
            !notification.recipients.some(id => id.toString() === employeeId)
        ) {
            return res.status(200).json({ success: false, message: "Not authorized to read this notification" });
        }

        // Check if already marked as read
        if (!notification.readBy.includes(employeeId)) {
            notification.readBy.push(employeeId);
            await notification.save();
        }

        res.status(200).json({ success: true, message: "Notification marked as read", notification });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error marking notification as read", error: error.message });
    }
};

exports.deleteNotification = async (req, res) => { 
    try {
        const { notificationId } = req.params;
        const employeeId = req.user.userId;

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(200).json({ success: false, message: "Notification not found" });
        }

        // Check if the employee is a recipient
        if (
            Array.isArray(notification.recipients) &&
            !notification.recipients.some(id => id.toString() === employeeId)
        ) {
            return res.status(200).json({ success: false, message: "Not authorized to delete this notification" });
        }

        await Notification.deleteOne({ _id: notificationId });

        res.status(200).json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error deleting notification", error: error.message });
    }
}

exports.sendNotification = async (recipients, title, message, type) => { 

    if (!Array.isArray(recipients)) {
        recipients = [recipients];
    }

    const notification = new Notification({
        recipients,
        title,
        message,
        type,
    });
    await notification.save();

    return notification;
}