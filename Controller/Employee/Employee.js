const Employee = require('../../models/Employee')



//UPDATE EMAIL
const updateEmail = async (req, res) => {
    const { oldEmail } = req.params;
    const { newEmail } = req.body;

    if (!newEmail) {
        return res.status(400).json({ success: false, message: 'New email is required' });
    }

    try {
        const user = await Employee.findOne({ Email: oldEmail });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with the given email' });
        }

        user.Email = newEmail;
        await user.save();

        res.status(200).json({ success: true, message: 'Email updated successfully', email: newEmail });
    } catch (err) {
        console.error("Update Email Error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};





module.exports = {updateEmail}