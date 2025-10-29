-- Fix Contacts Table
-- This script drops and recreates the contacts table with the correct structure
-- WARNING: This will delete all existing contact data!

USE value_aim;

-- Drop existing table
DROP TABLE IF EXISTS contacts;

-- Create contacts table
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
    adminNotes TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (userId),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show table structure
DESCRIBE contacts;

-- Show indexes
SHOW INDEX FROM contacts;

