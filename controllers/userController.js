import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, email, picture } = req.body;

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (picture) user.picture = picture;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        picture: updatedUser.picture,
        plan: updatedUser.plan
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/user/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has password (not OAuth user)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change password for OAuth users'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};

// @desc    Update user plan
// @route   PUT /api/user/plan
// @access  Private
export const updateUserPlan = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!['Free Plan', 'Pro Plan', 'Enterprise Plan'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { plan },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating plan'
    });
  }
};

