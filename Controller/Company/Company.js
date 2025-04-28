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


const updateWorkTimings = async (req, res) => {
  const { id } = req.params;
  const { workTimings } = req.body;

  if (!workTimings) {
    return res.status(400).json({ message: "Both clockIn and clockOut times are required." });
  }

  try {
    const updatedCompany = await Company.findById(id);

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company record not found." });
    }

    updatedCompany.workTimings = workTimings;

    await updatedCompany.save();

    res.status(200).json({
      message: "Work timings updated successfully.",
      data: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating work timings:", error);
    res.status(500).json({ message: "Server error updating work timings." });
  }
};

const getEmployeesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const employees = await Employee.find({ companyID: companyId });

    if (employees.length === 0) {
      return res.status(404).json({ message: "No employees found for this company" });
    }

    res.status(200).json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createCompany,
  uploadDocuments,
  getDepartmentsWithPositions,
  getEmployeesByCompany,
  updateWorkTimings
};
