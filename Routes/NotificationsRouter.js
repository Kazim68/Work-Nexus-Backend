const express = require('express');
const router = express.Router();
const { UserRoles } = require('../utils/Enums.js');
const { auth, authorizeRoles } = require('../middleware/authMiddleware.js');

const { getNotifications, markNotificationAsRead, deleteNotification } = require('../Controller/Notifications/NotificationController.js');

router.get('/myNotifications', auth, getNotifications);
router.patch('/markAsRead/:notificationId', auth, markNotificationAsRead);
router.delete('/delete/:notificationId', auth, deleteNotification);

module.exports = router;