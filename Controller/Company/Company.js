// controllers/companyController.js
const { default: mongoose } = require('mongoose');
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


const getDepartmentsWithPositions = async (req, res) => {
  const { companyId } = req.params;

  try {
    // ✅ Validate and convert to ObjectId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid company ID format" });
    }

    const objectCompanyId = new mongoose.Types.ObjectId(companyId);

    // ✅ Perform aggregation
    const departmentsWithPositions = await Employee.aggregate([
      {
        $match: { companyID: objectCompanyId }
      },
      {
        $group: {
          _id: "$department",
          positions: { $addToSet: "$position" }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          positions: 1
        }
      },
      {
        $sort: { department: 1 }
      }
    ]);

    res.status(200).json({ data: departmentsWithPositions });
  } catch (error) {
    console.error("Error fetching departments and positions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createCompany,
  uploadDocuments,
  getDepartmentsWithPositions
};
