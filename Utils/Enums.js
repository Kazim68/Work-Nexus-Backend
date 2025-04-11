// User roles
const UserRoles = Object.freeze({
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
    HR: 'hr',
});

// User statuses
const UserStatus = Object.freeze({
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
});

// Departments
const Departments = Object.freeze({
    HR: 'hr',
    IT: 'it',
});

// Documents Types
const DocumentTypes = Object.freeze({
    ID_PROOF: 'id_proof',
    PAYSLIP: 'payslip',
    RESUME: 'resume',
    EXPERIENCE_CERTIFICATE: 'experience_certificate',
    OTHER: 'other',
});

// Leave statuses
const LeaveStatus = Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
});

// Leave types
const LeaveTypes = Object.freeze({
    SICK: 'sick',
    CASUAL: 'casual',
    EARNED: 'earned',
    UNPAID: 'unpaid',
});

// Notification types
const NotificationTypes = Object.freeze({
    LEAVE_REQUEST: 'leave_request',
    LEAVE_APPROVED: 'leave_approved',
    LEAVE_REJECTED: 'leave_rejected',
    DOCUMENT_UPLOADED: 'document_uploaded',
});

// Export all enums
module.exports = {
    UserRoles,
    LeaveStatus,
    UserStatus,
    Departments,
    DocumentTypes,
    LeaveTypes,
    NotificationTypes,
};

