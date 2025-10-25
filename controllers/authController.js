import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password, name, provider, providerId, picture } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    console.log('=== REGISTER USER ===');
    console.log('Email:', email);
    console.log('Provider:', provider);
    console.log('Picture:', picture);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: provider === 'email' ? password : undefined,
      provider: provider || 'email',
      providerId,
      picture, // Save the picture URL (Google image or other OAuth provider)
      isFirstLogin: true
    });

    console.log('User created with picture:', user.picture);

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          provider: user.provider,
          picture: user.picture,
          isFirstLogin: user.isFirstLogin,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          plan: user.plan,
          token: generateToken(user.id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, provider, providerId, name, picture } = req.body;

    // If OAuth login, find or create user
    if (provider && provider !== 'email') {
      console.log('=== OAUTH LOGIN ===');
      console.log('Provider:', provider);
      console.log('Email:', email);
      console.log('Picture:', picture);
      
      let user = await User.findOne({ where: { email } });

      if (!user) {
        console.log('Creating new OAuth user');
        // Create new OAuth user
        user = await User.create({
          email,
          name,
          provider,
          providerId,
          picture, // Save the Google image URL
          isFirstLogin: true
        });
        console.log('User created with picture:', user.picture);
      } else {
        console.log('Existing user found');
        console.log('Current user picture:', user.picture);
        console.log('New picture provided:', picture);
        
        // Update picture only if user doesn't have one and new picture is provided
        if (!user.picture && picture) {
          console.log('Updating empty picture with new picture');
          await user.update({ picture });
          user.picture = picture;
        } else if (user.picture) {
          console.log('User already has a picture, keeping existing one');
        }
      }

      return res.json({
        success: true,
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          provider: user.provider,
          picture: user.picture,
          isFirstLogin: user.isFirstLogin,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          companyDetailsCompleted: user.companyDetailsCompleted,
          serviceDetailsCompleted: user.serviceDetailsCompleted,
          plan: user.plan,
          token: generateToken(user.id)
        }
      });
    }

    // Email/Password login
    const user = await User.findOne({ where: { email } });

    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          provider: user.provider,
          picture: user.picture,
          isFirstLogin: user.isFirstLogin,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          companyDetailsCompleted: user.companyDetailsCompleted,
          serviceDetailsCompleted: user.serviceDetailsCompleted,
          plan: user.plan,
          token: generateToken(user.id)
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user onboarding status
// @route   PUT /api/auth/onboarding
// @access  Private
export const updateOnboarding = async (req, res) => {
  try {
    const { companyDetailsCompleted, serviceDetailsCompleted } = req.body;

    const user = await User.findById(req.user.id);

    if (companyDetailsCompleted !== undefined) {
      user.companyDetailsCompleted = companyDetailsCompleted;
    }

    if (serviceDetailsCompleted !== undefined) {
      user.serviceDetailsCompleted = serviceDetailsCompleted;
    }

    if (user.companyDetailsCompleted && user.serviceDetailsCompleted) {
      user.hasCompletedOnboarding = true;
      user.isFirstLogin = false;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        isFirstLogin: user.isFirstLogin,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        companyDetailsCompleted: user.companyDetailsCompleted,
        serviceDetailsCompleted: user.serviceDetailsCompleted
      }
    });
  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

