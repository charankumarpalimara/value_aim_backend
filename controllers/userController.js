import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/profile/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

export { upload };

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

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
    console.log('=== USER PROFILE UPDATE REQUEST ===');
    console.log('User ID:', req.user.id);
    console.log('Request method:', req.method);
    console.log('Content-Type:', req.get('content-type'));
    console.log('Body data (name, email):', {
      name: req.body.name,
      email: req.body.email
    });
    console.log('File uploaded:', req.file ? {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    console.log('All form fields:', Object.keys(req.body));

    const user = await User.findByPk(req.user.id);

    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, email } = req.body;
    const updateData = {};

    // Update fields
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Handle image upload
    if (req.file) {
      // Use hosted URL for production, dynamic URL for development
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        updateData.picture = `https://value-aim-backend.onrender.com/uploads/profile/${req.file.filename}`;
      } else {
        const protocol = req.protocol;
        const host = req.get('host');
        updateData.picture = `${protocol}://${host}/uploads/profile/${req.file.filename}`;
      }
      console.log('Image URL created:', updateData.picture);
    }

    console.log('Update data to be applied:', updateData);
    
    const updatedUser = await user.update(updateData);

    console.log('User updated successfully:', {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      picture: updatedUser.picture
    });

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
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

    const user = await User.findByPk(req.user.id);

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
    await user.update({ password: newPassword });

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

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ plan });

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating plan'
    });
  }
};

