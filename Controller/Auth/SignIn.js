const Employee = require('../../models/Employee')
const PricingPlan = require('../../models/PricingPlan');

const signIn = async (req, res) => {
  const { email, password } = req.body;

  // 1. Find employee
  const employee = await Employee.findOne({ email });
  if (!employee) {
    return res.status(401).json({ message: 'Invalid Credentials' });
  }

  // 2. Match password
  const isMatch = await employee.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid Credentials' });
  }

  // 3. Get associated pricing plan
  const pricingPlan = await PricingPlan.findOne({ employeeId: employee._id });

  // 4. Count how many employees belong to the same company
  const companyEmployeeCount = await Employee.countDocuments({ companyID: employee.companyID });

  // 5. Create token
  const token = employee.createJWT();

  // 6. Return response
  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    employee,
    pricingPlan: pricingPlan || null,
    companyEmployeeCount
  });
};

module.exports = { signIn }