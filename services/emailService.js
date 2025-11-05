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
            line-height: 1.6; 
            color: #333;
            background: #f5f7fa;
            padding: 20px;
          }
          .email-wrapper { 
            max-width: 650px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(32, 31, 71, 0.12);
          }
          .header { 
            background: linear-gradient(135deg, #201F47 0%, #15143a 100%);
            color: white; 
            padding: 48px 40px;
            text-align: center;
          }
          .header-icon {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
          }
          .header h1 { 
            font-size: 28px; 
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .header p {
            margin: 12px 0 0 0;
            opacity: 0.9;
            font-size: 15px;
          }
          .content { 
            padding: 40px;
          }
          .info-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
          }
          .info-row {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          .label { 
            font-weight: 600;
            color: #201F47;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .value { 
            color: #4b5563;
            font-size: 15px;
            line-height: 1.6;
          }
          .user-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
          }
          .suggestion-box {
            background: white;
            border: 2px solid #e5e7eb;
            border-left: 4px solid #201F47;
            padding: 20px;
            border-radius: 10px;
            font-size: 15px;
            line-height: 1.8;
            color: #374151;
            font-style: italic;
          }
          .attachment-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #fbbf24;
            padding: 16px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .attachment-icon {
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
          }
          .attachment-info {
            flex: 1;
          }
          .attachment-name {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 4px;
          }
          .attachment-size {
            font-size: 13px;
            color: #b45309;
          }
          .timestamp-box {
            background: #e0e7ff;
            padding: 12px 16px;
            border-radius: 8px;
            text-align: center;
          }
          .timestamp {
            color: #3730a3;
            font-weight: 500;
            font-size: 14px;
          }
          .footer { 
            text-align: center;
            padding: 32px 40px;
            background: #f8f9fa;
            color: #6b7280;
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
          }
          .footer-links {
            margin-top: 16px;
          }
          .footer-links a {
            color: #201F47;
            text-decoration: none;
            margin: 0 8px;
            font-weight: 500;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 32px 24px; }
            .content { padding: 24px; }
            .footer { padding: 24px; }
            .header h1 { font-size: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="header-icon">💡</div>
            <h1>New Suggestion Received!</h1>
            <p>A user has shared valuable feedback</p>
          </div>
          
          <div class="content">
            <div class="info-card">
              <div class="info-row">
                <div class="label">
                  <span>👤</span> FROM
                </div>
                <div class="user-badge">
                  <span style="font-size: 20px;">👨‍💼</span>
                  <div>
                    <div style="font-weight: 600;">${name}</div>
                    <div style="font-size: 13px; opacity: 0.9;">${email}</div>
                  </div>
                </div>
              </div>
              
              <div class="info-row">
                <div class="label">
                  <span>📝</span> SUGGESTION
                </div>
                <div class="suggestion-box">
                  ${suggestion || 'No text provided - Please check attachment'}
                </div>
              </div>
              
              ${attachmentName ? `
                <div class="info-row">
                  <div class="label">
                    <span>📎</span> ATTACHMENT
                  </div>
                  <div class="attachment-box">
                    <div class="attachment-icon">📄</div>
                    <div class="attachment-info">
                      <div class="attachment-name">${attachmentName}</div>
                      <div class="attachment-size">File Size: ${(attachmentSize / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                </div>
              ` : ''}
              
              <div class="info-row">
                <div class="label">
                  <span>🕐</span> SUBMITTED
                </div>
                <div class="timestamp-box">
                  <div class="timestamp">${new Date().toLocaleString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>ValueAIM</strong> - Amplifying Customer Intelligence</p>
            <p style="margin-top: 8px; font-size: 12px;">This is an automated notification from your ValueAIM platform</p>
            <div class="footer-links">
              <a href="https://valueaim.com">Visit Website</a> •
              <a href="mailto:charanpalimara@gmail.com">Contact Support</a>
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333;
            background: #f5f7fa;
            padding: 20px;
          }
          .email-wrapper { 
            max-width: 650px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(32, 31, 71, 0.12);
          }
          .header { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white; 
            padding: 48px 40px;
            text-align: center;
          }
          .header-icon {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
          }
          .header h1 { 
            font-size: 28px; 
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .header p {
            margin: 12px 0 0 0;
            opacity: 0.9;
            font-size: 15px;
          }
          .content { 
            padding: 40px;
          }
          .priority-badge {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
          }
          .contact-header {
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
            border: 2px solid #6366f1;
            border-radius: 12px;
            padding: 20px 24px;
            margin-bottom: 24px;
          }
          .contact-title {
            color: #201F47;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .contact-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .detail-item {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .detail-icon {
            width: 36px;
            height: 36px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }
          .detail-info {
            flex: 1;
          }
          .detail-label {
            font-size: 11px;
            color: #4338ca;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .detail-value {
            color: #1e293b;
            font-weight: 500;
            font-size: 14px;
          }
          .message-section {
            margin-top: 24px;
          }
          .section-label {
            font-weight: 600;
            color: #201F47;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .message-box {
            background: white;
            border: 2px solid #e5e7eb;
            border-left: 4px solid #10b981;
            padding: 24px;
            border-radius: 10px;
            font-size: 15px;
            line-height: 1.8;
            color: #374151;
            white-space: pre-wrap;
            min-height: 120px;
          }
          .timestamp-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 12px 20px;
            border-radius: 8px;
            text-align: center;
            margin-top: 24px;
          }
          .timestamp {
            color: #92400e;
            font-weight: 500;
            font-size: 13px;
          }
          .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            margin-top: 24px;
            transition: all 0.3s ease;
          }
          .footer { 
            text-align: center;
            padding: 32px 40px;
            background: #f8f9fa;
            color: #6b7280;
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
          }
          .footer-links {
            margin-top: 16px;
          }
          .footer-links a {
            color: #201F47;
            text-decoration: none;
            margin: 0 8px;
            font-weight: 500;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 32px 24px; }
            .content { padding: 24px; }
            .footer { padding: 24px; }
            .header h1 { font-size: 24px; }
            .contact-details { grid-template-columns: 1fr; gap: 12px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="header-icon">📧</div>
            <h1>New Contact Inquiry!</h1>
            <p>Someone wants to connect with you</p>
          </div>
          
          <div class="content">
            <div class="priority-badge">🔔 NEW MESSAGE</div>
            
            <div class="contact-header">
              <div class="contact-title">
                <span>📋</span> Contact Information
              </div>
              <div class="contact-details">
                <div class="detail-item">
                  <div class="detail-icon">👤</div>
                  <div class="detail-info">
                    <div class="detail-label">Full Name</div>
                    <div class="detail-value">${firstName} ${lastName}</div>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-icon">📧</div>
                  <div class="detail-info">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${email}</div>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-icon">📱</div>
                  <div class="detail-info">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${phoneNumber}</div>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-icon">📌</div>
                  <div class="detail-info">
                    <div class="detail-label">Subject</div>
                    <div class="detail-value">${subject}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="message-section">
              <div class="section-label">
                <span>💬</span> MESSAGE
              </div>
              <div class="message-box">${message}</div>
            </div>
            
            <div class="timestamp-box">
              <div class="timestamp">⏰ Received: ${new Date().toLocaleString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}</div>
            </div>
            
            <div style="text-align: center;">
              <a href="mailto:${email}" class="action-button">
                ↩️ Reply to ${firstName}
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>ValueAIM</strong> - Amplifying Customer Intelligence</p>
            <p style="margin-top: 8px; font-size: 12px;">This is an automated notification from your ValueAIM platform</p>
            <div class="footer-links">
              <a href="https://valueaim.com">Visit Website</a> •
              <a href="mailto:charanpalimara@gmail.com">Contact Support</a>
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
