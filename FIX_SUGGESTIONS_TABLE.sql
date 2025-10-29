-- Fix Suggestions Table Column Names
-- This script drops the old table and creates it with correct snake_case column names
-- Database: value_aim

USE value_aim;

-- Drop the existing table (if you don't have important data in it)
DROP TABLE IF EXISTS suggestions;

-- Create Suggestions Table with correct snake_case columns
CREATE TABLE IF NOT EXISTS suggestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    suggestion TEXT NULL,
    attachment_path VARCHAR(500) NULL,
    attachment_name VARCHAR(255) NULL,
    attachment_size INT NULL,
    status ENUM('pending', 'reviewed', 'implemented', 'rejected') DEFAULT 'pending',
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify the table structure
DESCRIBE suggestions;

SELECT 'Suggestions table fixed successfully!' as status;

