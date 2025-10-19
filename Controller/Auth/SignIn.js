const Employee = require('../../models/Employee')
const PricingPlan = require('../../models/PricingPlan');

const signIn = async (req, res) => {
  console.log("signIn function called");
  const { email, password } = req.body;

  // 1. Find employee
  console.log("Finding employee with email:", email);
  const employee = await Employee.findOne({ email }).populate('companyID');
  if (!employee) {
    console.log("Employee not found");
    return res.status(401).json({ message: 'Invalid Credentials' });
  }

  // 2. Match password
  console.log("Matching password");
  const isMatch = await employee.comparePassword(password);
  if (!isMatch) {
    console.log("Password does not match");
    return res.status(401).json({ message: 'Invalid Credentials' });
  }

  // 3. Get associated pricing plan
  console.log("Fetching pricing plan for employee:", employee._id);
  const pricingPlan = await PricingPlan.findOne({ employeeId: employee._id });

  // 4. Count how many employees belong to the same company
  console.log("Counting employees for company:", employee.companyID);
  const companyEmployeeCount = await Employee.countDocuments({ companyID: employee.companyID });

  // 5. Create token
  console.log("Creating JWT for employee:", employee._id);
  const token = employee.createJWT();

  // 6. Return response
  console.log("Login successful for employee:", employee._id);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    employee,
    pricingPlan: pricingPlan || null,
    companyEmployeeCount,

  });
};

module.exports = { signIn }