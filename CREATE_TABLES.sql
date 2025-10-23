-- Value Aim Database Tables Creation Script
-- Database: value_aim
-- Run these commands in your MySQL database

USE value_aim;

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NULL,
    provider ENUM('email', 'google', 'microsoft', 'apple') DEFAULT 'email',
    providerId VARCHAR(255) NULL,
    picture VARCHAR(500) NULL,
    isFirstLogin BOOLEAN DEFAULT true,
    hasCompletedOnboarding BOOLEAN DEFAULT false,
    companyDetailsCompleted BOOLEAN DEFAULT false,
    serviceDetailsCompleted BOOLEAN DEFAULT false,
    plan ENUM('Free Plan', 'Pro Plan', 'Enterprise Plan') DEFAULT 'Free Plan',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_provider (provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    companyName VARCHAR(255) NULL,
    industry VARCHAR(255) NULL,
    website VARCHAR(500) NULL,
    country VARCHAR(255) NULL,
    city VARCHAR(255) NULL,
    employees ENUM('', '1-10', '11-50', '51-200', '201-1000', '1000+') DEFAULT '',
    description TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create Services Table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    interests JSON NULL,
    keywords JSON NULL,
    adjacencyExpansion JSON NULL,
    targetIndustry JSON NULL,
    functionType JSON NULL,
    targetSegment JSON NULL,
    offerStatus ENUM('Active', 'Inactive') DEFAULT 'Active',
    description TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (userId),
    INDEX idx_offer_status (offerStatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(userId);
CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(userId);

-- 5. Show created tables
SHOW TABLES;

-- 6. Show table structures
DESCRIBE users;
DESCRIBE companies;
DESCRIBE services;
