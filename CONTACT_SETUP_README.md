-- Contact Us Table Setup Instructions
-- =====================================

-- 1. Run the SQL migration file to create the contacts table:
--    mysql -u your_username -p value_aim < CREATE_CONTACTS_TABLE.sql
--
--    Or run the SQL commands directly in your MySQL client:
--    USE value_aim;
--    Then copy and paste the contents of CREATE_CONTACTS_TABLE.sql

-- 2. The contacts table will store all contact form submissions with:
--    - firstName, lastName, email, phoneNumber (user contact info)
--    - subject, message (message content)
--    - userId (optional - links to user if logged in)
--    - status (new, in_progress, resolved, closed)
--    - adminNotes (for internal notes)

-- 3. API Endpoints:
--    POST /api/contact - Create contact message (Public - no auth required)
--    GET /api/contact - Get all contacts (Admin only)
--    GET /api/contact/:id - Get single contact (Admin only)
--    PUT /api/contact/:id/status - Update contact status (Admin only)
--    DELETE /api/contact/:id - Delete contact (Admin only)

-- 4. The frontend Contact Us form will automatically submit to the backend
--    The endpoint works with or without authentication token

-- 5. Contact messages are stored in the database and can be managed by admins

