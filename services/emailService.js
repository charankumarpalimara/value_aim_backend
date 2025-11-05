// Using fetch for SendinBlue API since we're using ES modules
const SENDINBLUE_API_KEY = process.env.SENDINBLUE_API_KEY;
const SENDINBLUE_API_URL = 'https://api.brevo.com/v3/smtp/email';

// OTP templates
const templates = {
  accountCreation: {
    subject: 'Verify Your Email - Account Creation',
    htmlContent: (otp) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #667eea; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ValueAIM!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for creating an account with us. To complete your registration, please verify your email address using the OTP code below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Your verification code is:</p>
              <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>This code will expire in 5 minutes.</strong></p>
            
            <p style="color: #666; font-size: 14px;">If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ValueAIM. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  loginVerification: {
    subject: 'Login Verification Code',
    htmlContent: (otp, email) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #667eea; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .security-notice { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Login Verification</h1>
          </div>
          <div class="content">
            <h2>Security Alert</h2>
            <p>Hello!</p>
            <p>Someone is trying to log in to your ValueAIM account (<strong>${email}</strong>).</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Your login verification code is:</p>
              <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>This code will expire in 5 minutes.</strong></p>
            
            <div class="security-notice">
              <strong>⚠️ Security Notice:</strong><br>
              If you didn't attempt to log in, please ignore this email or contact our support team immediately.
            </div>
            
            <p style="color: #666; font-size: 14px;">Never share this code with anyone. ValueAIM staff will never ask for this code.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ValueAIM. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, type = 'loginVerification', otpCode) => {
  try {
    // Use provided OTP or generate new one
    const otp = otpCode || generateOTP();
    const template = templates[type];
    
    if (!template) {
      throw new Error(`Invalid email template type: ${type}`);
    }

    console.log('Sending OTP email with code:', otp, 'to:', email);

    const emailData = {
      sender: { 
        name: 'ValueAIM', 
        email: 'no_reply@valueaim.com' 
      },
      to: [{ email: email }],
      subject: template.subject,
      htmlContent: type === 'loginVerification' 
        ? template.htmlContent(otp, email)
        : template.htmlContent(otp)
    };

    const response = await fetch(SENDINBLUE_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': SENDINBLUE_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const responseData = await response.json();
    
    if (response.ok) {
      console.log('OTP email sent successfully:', responseData);
      
      return {
        success: true,
        otp: otp,
        messageId: responseData.messageId
      };
    } else {
      throw new Error(`Failed to send email: ${responseData.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Send suggestion notification email to admin
export const sendSuggestionNotification = async (suggestionData, userData) => {
  try {
    const { suggestion, attachmentName, attachmentSize } = suggestionData;
    const { name, email } = userData;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #201F47 0%, #15143a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #201F47; }
          .label { font-weight: bold; color: #201F47; margin-bottom: 5px; }
          .value { color: #666; margin-bottom: 15px; }
          .suggestion-text { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 15px 0; font-style: italic; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 New Suggestion Received</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <div class="label">From:</div>
              <div class="value">${name} (${email})</div>
              
              <div class="label">Suggestion:</div>
              <div class="suggestion-text">${suggestion || 'No text - file attachment only'}</div>
              
              ${attachmentName ? `
                <div class="label">Attachment:</div>
                <div class="value">
                  📎 ${attachmentName} (${(attachmentSize / 1024 / 1024).toFixed(2)} MB)
                </div>
              ` : ''}
              
              <div class="label">Submitted At:</div>
              <div class="value">${new Date().toLocaleString()}</div>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 ValueAIM. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailData = {
      sender: { 
        name: 'ValueAIM Suggestions', 
        email: 'no_reply@valueaim.com' 
      },
      to: [{ email: 'charanpalimara@gmail.com' }],
      subject: `New Suggestion from ${name}`,
      htmlContent: htmlContent
    };

    const response = await fetch(SENDINBLUE_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': SENDINBLUE_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const responseData = await response.json();
    
    if (response.ok) {
      console.log('Suggestion notification email sent successfully:', responseData);
      return {
        success: true,
        messageId: responseData.messageId
      };
    } else {
      throw new Error(`Failed to send email: ${responseData.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error sending suggestion notification email:', error);
    throw error;
  }
};

// Send contact form notification email to admin
export const sendContactNotification = async (contactData) => {
  try {
    const { firstName, lastName, email, phoneNumber, subject, message } = contactData;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #201F47 0%, #15143a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #201F47; }
          .label { font-weight: bold; color: #201F47; margin-bottom: 5px; }
          .value { color: #666; margin-bottom: 15px; }
          .message-text { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 15px 0; white-space: pre-wrap; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <div class="label">Name:</div>
              <div class="value">${firstName} ${lastName}</div>
              
              <div class="label">Email:</div>
              <div class="value">${email}</div>
              
              <div class="label">Phone:</div>
              <div class="value">${phoneNumber}</div>
              
              <div class="label">Subject:</div>
              <div class="value">${subject}</div>
              
              <div class="label">Message:</div>
              <div class="message-text">${message}</div>
              
              <div class="label">Submitted At:</div>
              <div class="value">${new Date().toLocaleString()}</div>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 ValueAIM. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailData = {
      sender: { 
        name: 'ValueAIM Contact Form', 
        email: 'no_reply@valueaim.com' 
      },
      to: [{ email: 'charanpalimara@gmail.com' }],
      replyTo: { email: email, name: `${firstName} ${lastName}` },
      subject: `Contact Form: ${subject}`,
      htmlContent: htmlContent
    };

    const response = await fetch(SENDINBLUE_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': SENDINBLUE_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const responseData = await response.json();
    
    if (response.ok) {
      console.log('Contact notification email sent successfully:', responseData);
      return {
        success: true,
        messageId: responseData.messageId
      };
    } else {
      throw new Error(`Failed to send email: ${responseData.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error sending contact notification email:', error);
    throw error;
  }
};

export { generateOTP };
