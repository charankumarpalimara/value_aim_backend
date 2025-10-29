# Suggestions Feature Setup Guide

## Overview
The suggestions feature allows users to submit feedback and suggestions with optional file attachments (up to 20MB). This guide will help you set up the backend infrastructure for this feature.

## Backend Structure

### Files Created
1. **`models/Suggestion.js`** - Sequelize model for suggestions table
2. **`controllers/suggestionController.js`** - Controller with CRUD operations and file upload handling
3. **`routes/suggestionRoutes.js`** - API routes for suggestions
4. **`CREATE_SUGGESTIONS_TABLE.sql`** - SQL migration script

### Files Modified
1. **`server.js`** - Added suggestion routes
2. **`models/index.js`** - Added Suggestion model associations
3. **Frontend: `src/utils/api.js`** - Added suggestion API endpoints
4. **Frontend: `src/components/UnifiedPopup.jsx`** - Connected to backend API

## Database Setup

### 1. Run the SQL Migration

Execute the SQL script to create the suggestions table:

```bash
# From the backend directory
mysql -u your_username -p value_aim < CREATE_SUGGESTIONS_TABLE.sql
```

Or run it directly in your MySQL client:

```sql
USE value_aim;

CREATE TABLE IF NOT EXISTS suggestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    suggestion TEXT NULL,
    attachmentPath VARCHAR(500) NULL,
    attachmentName VARCHAR(255) NULL,
    attachmentSize INT NULL,
    status ENUM('pending', 'reviewed', 'implemented', 'rejected') DEFAULT 'pending',
    adminNotes TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (userId),
    INDEX idx_status (status),
    INDEX idx_created_at (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Verify Table Creation

```sql
DESCRIBE suggestions;
SHOW TABLES;
```

## Backend Server Setup

### 1. Ensure Dependencies are Installed

The required package `multer` is already in your `package.json`. If you need to reinstall:

```bash
cd backend
npm install multer
```

### 2. Create Uploads Directory

The controller automatically creates the directory, but you can create it manually:

```bash
cd backend
mkdir -p uploads/suggestions
```

### 3. Restart the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### User Endpoints (Protected)

#### 1. Create Suggestion
**POST** `/api/suggestions`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
- `suggestion` (string, optional) - The suggestion text (max 250 characters)
- `attachment` (file, optional) - File attachment (max 20MB)

**Response:**
```json
{
  "success": true,
  "message": "Suggestion submitted successfully",
  "data": {
    "id": 1,
    "userId": 123,
    "suggestion": "Add dark mode feature",
    "attachmentPath": "/uploads/suggestions/suggestion-1234567890.pdf",
    "attachmentName": "feature-request.pdf",
    "attachmentSize": 153600,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Get User Suggestions
**GET** `/api/suggestions`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "suggestion": "Add dark mode",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 3. Get Single Suggestion
**GET** `/api/suggestions/:id`

**Headers:**
```
Authorization: Bearer <token>
```

#### 4. Delete Suggestion
**DELETE** `/api/suggestions/:id`

**Headers:**
```
Authorization: Bearer <token>
```

### Admin Endpoints (For Future Use)

#### 1. Get All Suggestions
**GET** `/api/suggestions/admin/all?status=pending&page=1&limit=10`

#### 2. Update Suggestion Status
**PUT** `/api/suggestions/:id/status`

**Body:**
```json
{
  "status": "reviewed",
  "adminNotes": "Under consideration for Q2 roadmap"
}
```

## Frontend Integration

### API Usage Example

```javascript
import { suggestionAPI } from '../utils/api';

// Create suggestion with file
const handleSubmit = async () => {
  const formData = new FormData();
  formData.append('suggestion', 'My suggestion text');
  formData.append('attachment', fileObject);
  
  const response = await suggestionAPI.create(formData);
  console.log(response);
};

// Get all user suggestions
const getSuggestions = async () => {
  const response = await suggestionAPI.getAll();
  console.log(response.data);
};
```

## File Upload Configuration

### Current Settings
- **Max File Size:** 20MB
- **Allowed File Types:** All types
- **Storage Location:** `backend/uploads/suggestions/`
- **File Naming:** `suggestion-{timestamp}-{random}.{extension}`

### Modify File Upload Limits

Edit `controllers/suggestionController.js`:

```javascript
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Change to 50MB
  }
});
```

### Restrict File Types

```javascript
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};
```

## Testing

### Test with cURL

```bash
# Create suggestion with file
curl -X POST http://localhost:8000/api/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "suggestion=Test suggestion" \
  -F "attachment=@/path/to/file.pdf"

# Get user suggestions
curl -X GET http://localhost:8000/api/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test with Postman

1. Create a new request
2. Set method to POST
3. URL: `http://localhost:8000/api/suggestions`
4. Headers:
   - Add `Authorization: Bearer YOUR_TOKEN`
5. Body:
   - Select `form-data`
   - Add `suggestion` (text)
   - Add `attachment` (file)
6. Send request

## Security Considerations

### Current Implementation
- ✅ Authentication required for all endpoints
- ✅ User can only access their own suggestions
- ✅ File size limit (20MB)
- ✅ Files stored outside web root
- ✅ Unique file naming prevents overwrites

### Additional Security (Recommended)
1. Add file type validation
2. Scan files for viruses
3. Implement rate limiting
4. Add CSRF protection
5. Validate file extensions

## Troubleshooting

### Issue: File upload fails
**Solution:** Ensure the `uploads/suggestions` directory exists and has write permissions

```bash
chmod 755 uploads/suggestions
```

### Issue: "Not allowed by CORS"
**Solution:** Add your frontend URL to the CORS whitelist in `server.js`

### Issue: Files not accessible
**Solution:** Verify the static file serving middleware in `server.js`:
```javascript
app.use('/uploads', express.static('uploads'));
```

### Issue: Database connection error
**Solution:** Verify database credentials in `.env` file

## Future Enhancements

### Planned Features
- [ ] Email notifications for new suggestions
- [ ] Admin dashboard for managing suggestions
- [ ] Voting system for popular suggestions
- [ ] Suggestion categories
- [ ] Comment threads on suggestions
- [ ] Suggestion analytics

### Admin Panel Integration
To create an admin panel, use the existing admin endpoints:
- `GET /api/suggestions/admin/all` - List all suggestions
- `PUT /api/suggestions/:id/status` - Update suggestion status

## Environment Variables

Add to your `.env` file if needed:

```env
MAX_FILE_SIZE=20971520  # 20MB in bytes
UPLOAD_DIR=uploads/suggestions
```

## Production Deployment

### Checklist
- [ ] Run database migrations
- [ ] Set up file storage (S3, CloudStorage, etc.)
- [ ] Configure CORS for production domain
- [ ] Set up file backup system
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring for uploads

### Recommended: Use Cloud Storage
For production, consider using cloud storage (AWS S3, Google Cloud Storage) instead of local file storage.

## Support

For issues or questions:
1. Check the logs: `backend/logs/` (if configured)
2. Review the error messages in the console
3. Verify all dependencies are installed
4. Ensure database migrations are run

---

**Last Updated:** January 2024
**Version:** 1.0.0

