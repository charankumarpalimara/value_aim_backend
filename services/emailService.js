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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f6f8fa;
            margin: 0;
            padding: 0;
          }
          .email-container { 
            max-width: 600px; 
            margin: 40px auto; 
            background: #ffffff;
            border: 1px solid #e1e4e8;
          }
          .logo-header { 
            padding: 32px 40px;
            background: #ffffff;
            border-bottom: 1px solid #e1e4e8;
            text-align: center;
          }
          .logo-img {
            height: 60px;
            width: auto;
          }
          .logo-title {
            font-size: 24px;
            font-weight: 700;
            color: #201F47;
            letter-spacing: -0.5px;
          }
          .hero-section {
            padding: 40px 40px 32px 40px;
            background: #ffffff;
          }
          .notification-badge {
            display: inline-block;
            background: #201F47;
            color: white;
            padding: 6px 14px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 20px;
          }
          .hero-title {
            font-size: 24px;
            font-weight: 600;
            color: #24292e;
            margin-bottom: 12px;
            line-height: 1.3;
          }
          .hero-subtitle {
            font-size: 15px;
            color: #586069;
            line-height: 1.5;
          }
          .content-section {
            padding: 0 40px 32px 40px;
            background: #ffffff;
          }
          .info-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 24px;
          }
          .info-row {
            border-bottom: 1px solid #e1e4e8;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            padding: 16px 0;
            font-size: 13px;
            font-weight: 600;
            color: #586069;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            width: 140px;
            vertical-align: top;
          }
          .info-value {
            padding: 16px 0;
            font-size: 15px;
            color: #24292e;
            line-height: 1.6;
          }
          .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #201F47 0%, #15143a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 16px;
          }
          .user-details {
            flex: 1;
          }
          .user-name {
            font-weight: 600;
            color: #24292e;
            font-size: 15px;
          }
          .user-email {
            font-size: 14px;
            color: #586069;
          }
          .suggestion-content {
            background: #f6f8fa;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 20px;
            font-size: 15px;
            line-height: 1.7;
            color: #24292e;
          }
          .attachment-card {
            background: #fffbeb;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .attachment-icon-box {
            width: 44px;
            height: 44px;
            background: white;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .attachment-icon-svg {
            width: 24px;
            height: 24px;
            color: #f59e0b;
          }
          .attachment-details {
            flex: 1;
            min-width: 0;
          }
          .attachment-filename {
            font-weight: 600;
            color: #92400e;
            font-size: 14px;
            margin-bottom: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .attachment-filesize {
            font-size: 13px;
            color: #b45309;
          }
          .timestamp-text {
            font-size: 14px;
            color: #586069;
          }
          .divider {
            height: 1px;
            background: #e1e4e8;
            margin: 32px 0;
          }
          .footer {
            padding: 32px 40px;
            background: #f6f8fa;
            text-align: center;
            border-top: 1px solid #e1e4e8;
          }
          .footer-text {
            font-size: 13px;
            color: #586069;
            line-height: 1.6;
          }
          .footer-brand {
            font-weight: 600;
            color: #201F47;
          }
          .footer-links {
            margin-top: 16px;
            font-size: 13px;
          }
          .footer-link {
            color: #201F47;
            text-decoration: none;
            font-weight: 500;
            margin: 0 10px;
          }
          .footer-link:hover {
            text-decoration: underline;
          }
          @media only screen and (max-width: 600px) {
            .email-container { margin: 20px auto; }
            .logo-header { padding: 24px; }
            .hero-section { padding: 32px 24px 24px 24px; }
            .content-section { padding: 0 24px 24px 24px; }
            .footer { padding: 24px; }
            .info-label { display: block; width: 100%; padding-bottom: 4px; }
            .info-value { display: block; padding-top: 4px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="logo-header">
            <img src="https://value-aim-backend.onrender.com/uploads/valueaim-logo.png" alt="ValueAIM" class="logo-img" />
          </div>
          
          <div class="hero-section">
            <div class="notification-badge">New Submission</div>
            <h1 class="hero-title">User Suggestion Received</h1>
            <p class="hero-subtitle">A user has submitted feedback through your platform</p>
          </div>
          
          <div class="content-section">
            <table class="info-table">
              <tr class="info-row">
                <td class="info-label">Submitted By</td>
                <td class="info-value">
                  <div class="user-info">
                    <div class="user-avatar">${name.charAt(0).toUpperCase()}</div>
                    <div class="user-details">
                      <div class="user-name">${name}</div>
                      <div class="user-email">${email}</div>
                    </div>
                  </div>
                </td>
              </tr>
              
              <tr class="info-row">
                <td class="info-label">Suggestion</td>
                <td class="info-value">
                  <div class="suggestion-content">
                    ${suggestion || 'No text provided — See attachment below'}
                  </div>
                </td>
              </tr>
              
              ${attachmentName ? `
                <tr class="info-row">
                  <td class="info-label">Attachment</td>
                  <td class="info-value">
                    <div class="attachment-card">
                      <div class="attachment-icon-box">
                        <svg class="attachment-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <div class="attachment-details">
                        <div class="attachment-filename">${attachmentName}</div>
                        <div class="attachment-filesize">${(attachmentSize / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ` : ''}
              
              <tr class="info-row">
                <td class="info-label">Date & Time</td>
                <td class="info-value">
                  <div class="timestamp-text">
                    ${new Date().toLocaleString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </div>
                </td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              <span class="footer-brand">ValueAIM</span> — Amplifying Customer Intelligence
            </p>
            <p class="footer-text" style="margin-top: 8px; font-size: 12px; color: #959da5;">
              This is an automated notification from your ValueAIM platform
            </p>
            <div class="footer-links">
              <a href="https://valueaim.com" class="footer-link">Website</a>
              <a href="mailto:info@valueaim.com" class="footer-link">Support</a>
            </div>
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
      to: [{ email: 'info@valueaim.com' }],
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f6f8fa;
            margin: 0;
            padding: 0;
          }
          .email-container { 
            max-width: 600px; 
            margin: 40px auto; 
            background: #ffffff;
            border: 1px solid #e1e4e8;
          }
          .logo-header { 
            padding: 32px 40px;
            background: #ffffff;
            border-bottom: 1px solid #e1e4e8;
            text-align: center;
          }
          .logo-img {
            height: 60px;
            width: auto;
          }
          .logo-title {
            font-size: 24px;
            font-weight: 700;
            color: #201F47;
            letter-spacing: -0.5px;
          }
          .hero-section {
            padding: 40px 40px 32px 40px;
            background: #ffffff;
          }
          .notification-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 6px 14px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 20px;
          }
          .hero-title {
            font-size: 24px;
            font-weight: 600;
            color: #24292e;
            margin-bottom: 12px;
            line-height: 1.3;
          }
          .hero-subtitle {
            font-size: 15px;
            color: #586069;
            line-height: 1.5;
          }
          .content-section {
            padding: 0 40px 32px 40px;
            background: #ffffff;
          }
          .info-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 24px;
          }
          .info-row {
            border-bottom: 1px solid #e1e4e8;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            padding: 16px 0;
            font-size: 13px;
            font-weight: 600;
            color: #586069;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            width: 140px;
            vertical-align: top;
          }
          .info-value {
            padding: 16px 0;
            font-size: 15px;
            color: #24292e;
            line-height: 1.6;
          }
          .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 16px;
          }
          .user-details {
            flex: 1;
          }
          .user-name {
            font-weight: 600;
            color: #24292e;
            font-size: 15px;
          }
          .user-email {
            font-size: 14px;
            color: #586069;
          }
          .contact-detail-item {
            margin-bottom: 4px;
            font-size: 15px;
            color: #24292e;
          }
          .contact-detail-label {
            display: inline-block;
            font-weight: 600;
            color: #586069;
            min-width: 60px;
          }
          .subject-box {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 12px 16px;
            font-size: 15px;
            font-weight: 600;
            color: #0c4a6e;
          }
          .message-content {
            background: #f6f8fa;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 20px;
            font-size: 15px;
            line-height: 1.7;
            color: #24292e;
            white-space: pre-wrap;
            min-height: 100px;
          }
          .timestamp-text {
            font-size: 14px;
            color: #586069;
          }
          .action-bar {
            margin-top: 32px;
            padding: 20px;
            background: #f6f8fa;
            border-radius: 6px;
            text-align: center;
          }
          .reply-button {
            display: inline-block;
            background: #201F47;
            color: white;
            padding: 12px 28px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s ease;
          }
          .reply-button:hover {
            background: #15143a;
          }
          .divider {
            height: 1px;
            background: #e1e4e8;
            margin: 32px 0;
          }
          .footer {
            padding: 32px 40px;
            background: #f6f8fa;
            text-align: center;
            border-top: 1px solid #e1e4e8;
          }
          .footer-text {
            font-size: 13px;
            color: #586069;
            line-height: 1.6;
          }
          .footer-brand {
            font-weight: 600;
            color: #201F47;
          }
          .footer-links {
            margin-top: 16px;
            font-size: 13px;
          }
          .footer-link {
            color: #201F47;
            text-decoration: none;
            font-weight: 500;
            margin: 0 10px;
          }
          .footer-link:hover {
            text-decoration: underline;
          }
          @media only screen and (max-width: 600px) {
            .email-container { margin: 20px auto; }
            .logo-header { padding: 24px; }
            .hero-section { padding: 32px 24px 24px 24px; }
            .content-section { padding: 0 24px 24px 24px; }
            .footer { padding: 24px; }
            .info-label { display: block; width: 100%; padding-bottom: 4px; }
            .info-value { display: block; padding-top: 4px; }
            .action-bar { padding: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="logo-header">
            <img src="https://value-aim-backend.onrender.com/uploads/valueaim-logo.png" alt="ValueAIM" class="logo-img" />
          </div>
          
          <div class="hero-section">
            <div class="notification-badge">Contact Request</div>
            <h1 class="hero-title">New Contact Form Submission</h1>
            <p class="hero-subtitle">Someone has reached out through your contact form</p>
          </div>
          
          <div class="content-section">
            <table class="info-table">
              <tr class="info-row">
                <td class="info-label">From</td>
                <td class="info-value">
                  <div class="user-info">
                    <div class="user-avatar">${firstName.charAt(0).toUpperCase()}</div>
                    <div class="user-details">
                      <div class="user-name">${firstName} ${lastName}</div>
                      <div class="user-email">${email}</div>
                    </div>
                  </div>
                </td>
              </tr>
              
              <tr class="info-row">
                <td class="info-label">Contact Info</td>
                <td class="info-value">
                  <div class="contact-detail-item">
                    <span class="contact-detail-label">Email:</span> ${email}
                  </div>
                  <div class="contact-detail-item">
                    <span class="contact-detail-label">Phone:</span> ${phoneNumber}
                  </div>
                </td>
              </tr>
              
              <tr class="info-row">
                <td class="info-label">Subject</td>
                <td class="info-value">
                  <div class="subject-box">${subject}</div>
                </td>
              </tr>
              
              <tr class="info-row">
                <td class="info-label">Message</td>
                <td class="info-value">
                  <div class="message-content">${message}</div>
                </td>
              </tr>
              
              <tr class="info-row">
                <td class="info-label">Date & Time</td>
                <td class="info-value">
                  <div class="timestamp-text">
                    ${new Date().toLocaleString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </div>
                </td>
              </tr>
            </table>
            
            <div class="action-bar">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="reply-button">
                Reply to ${firstName}
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              <span class="footer-brand">ValueAIM</span> — Amplifying Customer Intelligence
            </p>
            <p class="footer-text" style="margin-top: 8px; font-size: 12px; color: #959da5;">
              This is an automated notification from your ValueAIM platform
            </p>
            <div class="footer-links">
              <a href="https://valueaim.com" class="footer-link">Website</a>
              <a href="mailto:info@valueaim.com" class="footer-link">Support</a>
            </div>
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
      to: [{ email: 'info@valueaim.com' }],
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
