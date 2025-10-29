-- Value Aim Suggestions Table Creation Script
-- Database: value_aim
-- Run this command in your MySQL database

USE value_aim;

-- Create Suggestions Table
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

-- Show table structure
DESCRIBE suggestions;

