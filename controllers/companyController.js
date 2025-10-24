import Company from '../models/Company.js';
import User from '../models/User.js';

// @desc    Create or update company details
// @route   POST /api/company
// @access  Private
export const createOrUpdateCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyData = req.body;

    // Check if company already exists for this user
    let company = await Company.findOne({ where: { userId } });

    if (company) {
      // Update existing company
      await company.update({ ...companyData, userId });
    } else {
      // Create new company
      company = await Company.create({
        ...companyData,
        userId
      });

      // Update user's company details status
      await User.update({ companyDetailsCompleted: true }, { where: { id: userId } });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Company creation/update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving company details'
    });
  }
};

// @desc    Get company details
// @route   GET /api/company
// @access  Private
export const getCompany = async (req, res) => {
  try {
    const userId = req.user.id;

    const company = await Company.findOne({ where: { userId } });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company details not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company details'
    });
  }
};

// @desc    Delete company details
// @route   DELETE /api/company
// @access  Private
export const deleteCompany = async (req, res) => {
  try {
    const userId = req.user.id;

    const company = await Company.findOne({ where: { userId } });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company details not found'
      });
    }

    // Delete the company
    await company.destroy();

    // Update user's company details status
    await User.update({ companyDetailsCompleted: false }, { where: { id: userId } });

    res.json({
      success: true,
      message: 'Company details deleted successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting company details'
    });
  }
};

