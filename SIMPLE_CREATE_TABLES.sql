-- Simple Table Creation Commands for Value Aim Database
-- Run these commands one by one in your MySQL client

USE value_aim;

-- Create Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    provider ENUM('email', 'google', 'microsoft', 'apple') DEFAULT 'email',
    providerId VARCHAR(255),
    picture VARCHAR(500),
    isFirstLogin BOOLEAN DEFAULT true,
    hasCompletedOnboarding BOOLEAN DEFAULT false,
    companyDetailsCompleted BOOLEAN DEFAULT false,
    serviceDetailsCompleted BOOLEAN DEFAULT false,
    plan ENUM('Free Plan', 'Pro Plan', 'Enterprise Plan') DEFAULT 'Free Plan',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Companies Table
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    companyName VARCHAR(255),
    industry VARCHAR(255),
    website VARCHAR(500),
    country VARCHAR(255),
    city VARCHAR(255),
    employees ENUM('', '1-10', '11-50', '51-200', '201-1000', '1000+') DEFAULT '',
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Services Table
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    interests JSON,
    keywords JSON,
    adjacencyExpansion JSON,
    targetIndustry JSON,
    functionType JSON,
    targetSegment JSON,
    offerStatus ENUM('Active', 'Inactive') DEFAULT 'Active',
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Show tables
SHOW TABLES;
