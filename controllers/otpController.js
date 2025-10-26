import { sendOTPEmail, generateOTP } from '../services/emailService.js';
import OTP from '../models/OTP.js';
import { Op } from 'sequelize';

// Store OTP in database with expiration
const storeOTP = async (email, otp, purpose = 'login') => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  
  try {
    // Delete any existing OTP for this email and purpose
    await OTP.destroy({
      where: { email, purpose }
    });

    // Insert new OTP
    await OTP.create({
      email,
      otp,
      purpose,
      expires_at: expiresAt
    });

    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    throw error;
  }
};

// Verify OTP
const verifyOTPCode = async (email, otp, purpose = 'login') => {
  try {
    const otpRecord = await OTP.findOne({
      where: {
        email,
        otp,
        purpose,
        expires_at: { [Op.gt]: new Date() },
        used: false
      }
    });

    if (!otpRecord) {
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    // Mark OTP as used
    await otpRecord.update({ used: true });

    return { valid: true };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { email, purpose = 'login' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeOTP(email, otp, purpose);

    // Send OTP email
    const emailType = purpose === 'signup' || purpose === 'accountCreation' ? 'accountCreation' : 'loginVerification';
    await sendOTPEmail(email, emailType);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = 'login' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const result = await verifyOTPCode(email, otp, purpose);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
};

export default {
  sendOTP,
  verifyOTP
};
