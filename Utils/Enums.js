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
    UNPAID: 'unpaid',
});

// Notification types
const NotificationTypes = Object.freeze({
    LEAVE_REQUEST: 'leave_request',
    LEAVE_APPROVED: 'leave_approved',
    LEAVE_REJECTED: 'leave_rejected',
    DOCUMENT_UPLOADED: 'document_uploaded',
    TICKET_REQUEST: 'ticket_request',

});


const PricingPlans = Object.freeze({
    BASIC: 'basic',
    STANDARD: 'standard',
    PREMIUM: 'premium',
});


const IssueTypes = Object.freeze({
    PERSONAL: 'Personal',
    ATTENDANCE: 'Attendance',
    HARDWARE: 'Hardware',
    SOFTWARE: 'Software',
    NETWORK: 'Network',
    OTHER: 'Other'
});


const TokkenStatus = Object.freeze({
    OPEN: 'Open',
    INPROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REJECTED: 'Rejected'
})


const Position = Object.freeze({
    INTERN: "Intern",
    JUNIOR: "Junior",
    ASSOCIATE: "Associate",
    SENIOR: "Senior",
    LEAD: "Lead",
    MANAGER: "Manager",
    SENIOR_MANAGER: "Senior Manager",
    DIRECTOR: "Director",
    SENIOR_DIRECTOR: "Senior Director",
    VP: "Vice President",
    SVP: "Senior Vice President",
    EVP: "Executive Vice President",
    C_LEVEL: "C-Level Executive", // e.g., CFO, CTO, CHRO
    HEAD: "Head of Department"
})




// Export all enums
module.exports = {
    UserRoles,
    LeaveStatus,
    UserStatus,
    Departments,
    DocumentTypes,
    LeaveTypes,
    NotificationTypes,
    PricingPlans,
    IssueTypes,
    TokkenStatus,
    Position
};

