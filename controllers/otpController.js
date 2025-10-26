import { sendOTPEmail, generateOTP } from '../services/emailService.js';
import OTP from '../models/OTP.js';
import { Op } from 'sequelize';

// Store OTP in database with expiration
const storeOTP = async (email, otp, purpose = 'login') => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  
  try {
    console.log('Storing OTP:', { email, otp, purpose, expiresAt });
    
    // Delete any existing OTP for this email and purpose
    const deletedCount = await OTP.destroy({
      where: { email, purpose }
    });
    console.log('Deleted', deletedCount, 'existing OTP records');

    // Insert new OTP
    const otpRecord = await OTP.create({
      email,
      otp: otp.toString(), // Ensure OTP is stored as string
      purpose,
      expires_at: expiresAt
    });

    console.log('OTP stored successfully:', { id: otpRecord.id, email, otp: otpRecord.otp, purpose });
    
    // Verify it was stored correctly
    const verifyRecord = await OTP.findOne({ where: { id: otpRecord.id } });
    console.log('Verification - stored OTP in database:', verifyRecord ? verifyRecord.otp : 'not found');
    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    throw error;
  }
};

// Verify OTP
const verifyOTPCode = async (email, otp, purpose = 'login') => {
  try {
    const otpString = otp.toString(); // Ensure OTP is string for comparison
    console.log('Verifying OTP:', { email, otp: otpString, purpose });
    
    // First check if any OTP exists for this email
    const allOtps = await OTP.findAll({
      where: { email, purpose }
    });
    console.log('All OTPs in database for', email, ':', allOtps.map(o => ({ id: o.id, otp: o.otp, used: o.used, expires_at: o.expires_at })));
    
    const otpRecord = await OTP.findOne({
      where: {
        email,
        otp: otpString,
        purpose,
        expires_at: { [Op.gt]: new Date() },
        used: false
      }
    });

    console.log('OTP record found:', otpRecord ? { id: otpRecord.id, otp: otpRecord.otp } : 'null');

    if (!otpRecord) {
      console.log('OTP verification failed - record not found or expired/used');
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    // Mark OTP as used
    await otpRecord.update({ used: true });
    console.log('OTP verified successfully');

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
    console.log('Generated OTP for', email, ':', otp);
    
    await storeOTP(email, otp, purpose);

    // Send OTP email with the same OTP
    const emailType = purpose === 'signup' || purpose === 'accountCreation' ? 'accountCreation' : 'loginVerification';
    await sendOTPEmail(email, emailType, otp);

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
