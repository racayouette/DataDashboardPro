-- MS SQL Server Database Schema for Job Description Manager
-- Run this script in SQL Server Management Studio or sqlcmd

USE JobDescriptionDB;
GO

-- Create Sessions table for session storage
CREATE TABLE sessions (
    sid NVARCHAR(128) PRIMARY KEY,
    sess NVARCHAR(MAX) NOT NULL,
    expire DATETIME2 NOT NULL
);
GO

CREATE INDEX IDX_session_expire ON sessions(expire);
GO

-- Create Users table
CREATE TABLE users (
    id NVARCHAR(50) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE,
    firstName NVARCHAR(100),
    lastName NVARCHAR(100),
    profileImageUrl NVARCHAR(500),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Create Job Families table
CREATE TABLE jobFamilies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Create Job Descriptions table
CREATE TABLE jobDescriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    jobFamilyId INT,
    department NVARCHAR(255),
    location NVARCHAR(255),
    employmentType NVARCHAR(100),
    salaryRange NVARCHAR(255),
    description NVARCHAR(MAX),
    requirements NVARCHAR(MAX),
    benefits NVARCHAR(MAX),
    status NVARCHAR(50) DEFAULT 'Draft',
    version INT DEFAULT 1,
    createdBy NVARCHAR(50),
    approvedBy NVARCHAR(50),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (jobFamilyId) REFERENCES jobFamilies(id),
    FOREIGN KEY (createdBy) REFERENCES users(id),
    FOREIGN KEY (approvedBy) REFERENCES users(id)
);
GO

-- Create Job Description History table for version tracking
CREATE TABLE jobDescriptionHistory (
    id INT IDENTITY(1,1) PRIMARY KEY,
    jobDescriptionId INT NOT NULL,
    version INT NOT NULL,
    title NVARCHAR(255),
    description NVARCHAR(MAX),
    requirements NVARCHAR(MAX),
    benefits NVARCHAR(MAX),
    changes NVARCHAR(MAX),
    modifiedBy NVARCHAR(50),
    modifiedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (jobDescriptionId) REFERENCES jobDescriptions(id),
    FOREIGN KEY (modifiedBy) REFERENCES users(id)
);
GO

-- Create User Roles table
CREATE TABLE userRoles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId NVARCHAR(50) NOT NULL,
    role NVARCHAR(100) NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES users(id)
);
GO

-- Create Active Directory Configuration table
CREATE TABLE activeDirectoryConfigs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    environment NVARCHAR(20) NOT NULL, -- 'test' or 'live'
    serverUrl NVARCHAR(500) NOT NULL,
    baseDN NVARCHAR(500) NOT NULL,
    username NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    domain NVARCHAR(255),
    port INT DEFAULT 389,
    useSSL BIT DEFAULT 0,
    isActive BIT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    UNIQUE(environment) -- Only one config per environment
);
GO

-- Create Notifications table
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId NVARCHAR(50) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(50) DEFAULT 'info',
    isRead BIT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES users(id)
);
GO

-- Create Application Settings table
CREATE TABLE applicationSettings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    settingKey NVARCHAR(255) UNIQUE NOT NULL,
    settingValue NVARCHAR(MAX),
    description NVARCHAR(500),
    category NVARCHAR(100),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Create indexes for better performance
CREATE INDEX IDX_jobDescriptions_jobFamilyId ON jobDescriptions(jobFamilyId);
CREATE INDEX IDX_jobDescriptions_status ON jobDescriptions(status);
CREATE INDEX IDX_jobDescriptions_createdBy ON jobDescriptions(createdBy);
CREATE INDEX IDX_jobDescriptionHistory_jobDescriptionId ON jobDescriptionHistory(jobDescriptionId);
CREATE INDEX IDX_userRoles_userId ON userRoles(userId);
CREATE INDEX IDX_notifications_userId ON notifications(userId);
CREATE INDEX IDX_notifications_isRead ON notifications(isRead);
GO

-- Insert default application settings
INSERT INTO applicationSettings (settingKey, settingValue, description, category) VALUES
('app_name', 'Job Description Manager', 'Application name', 'general'),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)', 'files'),
('session_timeout', '3600', 'Session timeout in seconds (1 hour)', 'security'),
('password_min_length', '8', 'Minimum password length', 'security'),
('enable_notifications', 'true', 'Enable system notifications', 'notifications');
GO

-- Create triggers for updating timestamps
CREATE TRIGGER tr_users_update 
ON users 
FOR UPDATE 
AS 
BEGIN
    UPDATE users 
    SET updatedAt = GETDATE() 
    WHERE id IN (SELECT id FROM inserted);
END;
GO

CREATE TRIGGER tr_jobFamilies_update 
ON jobFamilies 
FOR UPDATE 
AS 
BEGIN
    UPDATE jobFamilies 
    SET updatedAt = GETDATE() 
    WHERE id IN (SELECT id FROM inserted);
END;
GO

CREATE TRIGGER tr_jobDescriptions_update 
ON jobDescriptions 
FOR UPDATE 
AS 
BEGIN
    UPDATE jobDescriptions 
    SET updatedAt = GETDATE() 
    WHERE id IN (SELECT id FROM inserted);
END;
GO

CREATE TRIGGER tr_activeDirectoryConfigs_update 
ON activeDirectoryConfigs 
FOR UPDATE 
AS 
BEGIN
    UPDATE activeDirectoryConfigs 
    SET updatedAt = GETDATE() 
    WHERE id IN (SELECT id FROM inserted);
END;
GO

CREATE TRIGGER tr_applicationSettings_update 
ON applicationSettings 
FOR UPDATE 
AS 
BEGIN
    UPDATE applicationSettings 
    SET updatedAt = GETDATE() 
    WHERE id IN (SELECT id FROM inserted);
END;
GO

PRINT 'Database schema created successfully!';
GO