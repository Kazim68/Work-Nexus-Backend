// controllers/companyController.js
const Company = require('../../models/Company');
const Employee = require('../../models/Employee');

// Create Company
const createCompany = async (req, res) => {
  try {
    const newCompany = new Company({
      companyName: req.body.companyName,
      companyType: req.body.companyType,
      employeeCount: req.body.employeeCount,
      address: req.body.address,
      contactEmail: req.body.contactEmail,
      contactPhone: req.body.contactPhone,
      companyStatus: req.body.companyStatus,
      pricingPlan: req.body.pricingPlan,
      documents: req.body.documents || [],
      workTimings: req.body.workTimings || [],
      companyLogo: req.body.companyLogo || null, 
    });

    const savedCompany = await newCompany.save();

    // Update the employee document with the new company's ID
     await Employee.findByIdAndUpdate(
      req.body.companyAdmin,
      { companyID: savedCompany._id },
      { new: true }
    );



    res.status(201).json({ message: 'Company created successfully', company: savedCompany });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Upload Documents
const uploadDocuments = (req, res) => {
    const documents = req.files['documents']?.map(file => file.path) || [];
    const logo = req.files['logo']?.[0]?.path || null;
  
    res.status(200).json({ documents, logo });
  };
  

module.exports = {
  createCompany,
  uploadDocuments
};
