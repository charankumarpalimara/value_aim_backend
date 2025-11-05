# Email Template Previews

This folder contains HTML preview files that show exactly how your email templates will look when sent.

## 📧 Preview Files

1. **suggestion-email-preview.html** - Preview of suggestion notification email
2. **contact-email-preview.html** - Preview of contact form notification email

## 🖥️ How to View

### Option 1: Open in Browser (Recommended)
1. Navigate to this folder in Finder/Explorer
2. Double-click any `.html` file
3. It will open in your default browser

### Option 2: Open from Terminal
```bash
# From backend directory
cd email-previews

# Open suggestion email preview
open suggestion-email-preview.html

# Open contact form preview
open contact-email-preview.html
```

### Option 3: Drag and Drop
1. Open your browser (Chrome, Safari, Firefox, etc.)
2. Drag the HTML file from Finder into the browser window

## 📱 Testing Responsive Design

To see how the emails look on mobile:

1. Open the preview in Chrome/Firefox
2. Press `F12` to open Developer Tools
3. Click the mobile device icon (📱)
4. Select different device sizes (iPhone, iPad, etc.)

## ✨ What You'll See

### Suggestion Email:
- Your ValueAIM logo at the top
- "NEW SUBMISSION" badge
- User avatar and info
- Suggestion text in a clean box
- Attachment card (yellow) with file details
- Formatted timestamp
- Professional footer

### Contact Form Email:
- Your ValueAIM logo at the top
- "CONTACT REQUEST" badge (green)
- User avatar and contact details
- Subject in blue highlight box
- Full message content
- Formatted timestamp
- "Reply to [Name]" button
- Professional footer

## 🎨 Template Features

✅ Professional GitHub/Stripe-inspired design
✅ Your branded ValueAIM logo
✅ Clean, scannable layout
✅ Mobile responsive
✅ Works in all email clients (Gmail, Outlook, Apple Mail, etc.)
✅ Proper spacing and typography
✅ Brand colors (#201F47 navy, #10b981 green)

## 📝 Sample Data

The preview files include realistic sample data:
- **Suggestion**: From "John Doe" with attachment
- **Contact**: From "Sarah Johnson" about Enterprise plan

## 🚀 Next Steps

After reviewing the previews:
1. If you like the design → Templates are ready to use!
2. If you want changes → Let me know what to adjust
3. To test with real data → Submit a form on your platform

---

**Note:** The logo is served from `backend/uploads/valueaim-logo.png` and in production will be loaded from your backend server.

