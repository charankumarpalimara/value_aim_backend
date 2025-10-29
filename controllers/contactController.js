import Contact from '../models/Contact.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper function to optionally get user from token
const getOptionalUser = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      const user = await User.findByPk(decoded.id);
      return user ? user.id : null;
    }
  } catch (error) {
    // If token is invalid or doesn't exist, just return null
    return null;
  }
  return null;
};

// @desc    Create contact message
// @route   POST /api/contact
// @access  Public (can be optionally protected)
export const createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, subject, message } = req.body;
    // Try to get userId if token exists, but don't require it
    const userId = await getOptionalUser(req);

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create contact message
    const contactData = {
      userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new'
    };

    const contact = await Contact.create(contactData);

    // Optionally send email notification to admin (you can implement this later)
    // await sendContactNotificationEmail(contact);

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating contact message'
    });
  }
};

// @desc    Get all contact messages (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
export const getAllContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const whereClause = status ? { status } : {};
    const offset = (page - 1) * limit;

    const contacts = await Contact.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        attributes: ['name', 'email'],
        required: false
      }]
    });

    res.json({
      success: true,
      count: contacts.count,
      data: contacts.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(contacts.count / limit)
      }
    });
  } catch (error) {
    console.error('Get all contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts'
    });
  }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['name', 'email'],
        required: false
      }]
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact message'
    });
  }
};

// @desc    Update contact status (Admin only)
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
export const updateContactStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    await contact.update({
      status: status || contact.status,
      adminNotes: adminNotes || contact.adminNotes
    });

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact status'
    });
  }
};

// @desc    Delete contact message (Admin only)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    await contact.destroy();

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact message'
    });
  }
};

