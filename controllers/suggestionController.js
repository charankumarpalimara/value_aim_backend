import Suggestion from '../models/Suggestion.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/suggestions');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'suggestion-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept all file types
const fileFilter = (req, file, cb) => {
  cb(null, true); // Accept all files
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB max file size
  }
});

// @desc    Create suggestion
// @route   POST /api/suggestions
// @access  Private
export const createSuggestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { suggestion } = req.body;
    const file = req.file;

    // Validate that either suggestion text or file is provided
    if (!suggestion && !file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a suggestion text or attach a file'
      });
    }

    // Prepare suggestion data
    const suggestionData = {
      userId,
      suggestion: suggestion || null,
      attachmentPath: file ? `/uploads/suggestions/${file.filename}` : null,
      attachmentName: file ? file.originalname : null,
      attachmentSize: file ? file.size : null,
      status: 'pending'
    };

    const createdSuggestion = await Suggestion.create(suggestionData);

    res.status(201).json({
      success: true,
      message: 'Suggestion submitted successfully',
      data: createdSuggestion
    });
  } catch (error) {
    console.error('Create suggestion error:', error);
    
    // Delete uploaded file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating suggestion'
    });
  }
};

// @desc    Get all suggestions for a user
// @route   GET /api/suggestions
// @access  Private
export const getUserSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    const suggestions = await Suggestion.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['name', 'email']
      }]
    });

    res.json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    console.error('Get user suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suggestions'
    });
  }
};

// @desc    Get single suggestion
// @route   GET /api/suggestions/:id
// @access  Private
export const getSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['name', 'email']
      }]
    });

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    // Make sure user owns this suggestion
    if (suggestion.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this suggestion'
      });
    }

    res.json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    console.error('Get suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suggestion'
    });
  }
};

// @desc    Delete suggestion
// @route   DELETE /api/suggestions/:id
// @access  Private
export const deleteSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findByPk(req.params.id);

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    // Make sure user owns this suggestion
    if (suggestion.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this suggestion'
      });
    }

    // Delete attached file if exists
    if (suggestion.attachmentPath) {
      const filePath = path.join(__dirname, '..', suggestion.attachmentPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await suggestion.destroy();

    res.json({
      success: true,
      message: 'Suggestion deleted successfully'
    });
  } catch (error) {
    console.error('Delete suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting suggestion'
    });
  }
};

// @desc    Get all suggestions (Admin only - for future use)
// @route   GET /api/suggestions/admin/all
// @access  Private/Admin
export const getAllSuggestions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const whereClause = status ? { status } : {};
    const offset = (page - 1) * limit;

    const suggestions = await Suggestion.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        attributes: ['name', 'email']
      }]
    });

    res.json({
      success: true,
      count: suggestions.count,
      data: suggestions.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(suggestions.count / limit)
      }
    });
  } catch (error) {
    console.error('Get all suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suggestions'
    });
  }
};

// @desc    Update suggestion status (Admin only - for future use)
// @route   PUT /api/suggestions/:id/status
// @access  Private/Admin
export const updateSuggestionStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const suggestion = await Suggestion.findByPk(req.params.id);

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    await suggestion.update({
      status,
      adminNotes: adminNotes || suggestion.adminNotes
    });

    res.json({
      success: true,
      message: 'Suggestion status updated successfully',
      data: suggestion
    });
  } catch (error) {
    console.error('Update suggestion status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating suggestion status'
    });
  }
};

