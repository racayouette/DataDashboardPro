-- =============================================
-- Job Management System Database Schema
-- Microsoft SQL Server Implementation
-- =============================================

-- Create database (uncomment if creating new database)
-- CREATE DATABASE JobManagementSystem;
-- GO
-- USE JobManagementSystem;
-- GO

-- =============================================
-- DROP TABLES (for clean setup)
-- =============================================
IF OBJECT_ID('audit_log', 'U') IS NOT NULL DROP TABLE audit_log;
IF OBJECT_ID('job_description_changes', 'U') IS NOT NULL DROP TABLE job_description_changes;
IF OBJECT_ID('essential_functions', 'U') IS NOT NULL DROP TABLE essential_functions;
IF OBJECT_ID('job_descriptions', 'U') IS NOT NULL DROP TABLE job_descriptions;
IF OBJECT_ID('jobs', 'U') IS NOT NULL DROP TABLE jobs;
IF OBJECT_ID('notifications', 'U') IS NOT NULL DROP TABLE notifications;
IF OBJECT_ID('reviewers', 'U') IS NOT NULL DROP TABLE reviewers;
IF OBJECT_ID('transactions', 'U') IS NOT NULL DROP TABLE transactions;
IF OBJECT_ID('dashboard_summary', 'U') IS NOT NULL DROP TABLE dashboard_summary;
IF OBJECT_ID('job_families', 'U') IS NOT NULL DROP TABLE job_families;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
GO

-- =============================================
-- CREATE TABLES
-- =============================================

-- Users table for authentication and user management
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'HR Manager', 'Reviewer', 'Employee')),
    department NVARCHAR(100) NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Inactive')),
    last_login DATETIME2,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Job families/categories
CREATE TABLE job_families (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_family NVARCHAR(255) NOT NULL,
    total_jobs INT NOT NULL DEFAULT 0,
    jobs_reviewed INT NOT NULL DEFAULT 0,
    description NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Job descriptions/positions
CREATE TABLE jobs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_code NVARCHAR(50) NOT NULL UNIQUE,
    job_title NVARCHAR(255) NOT NULL,
    job_family_id INT FOREIGN KEY REFERENCES job_families(id),
    reviewer_id INT FOREIGN KEY REFERENCES users(id),
    responsible_id INT FOREIGN KEY REFERENCES users(id),
    status NVARCHAR(50) NOT NULL CHECK (status IN ('In Progress', 'Not Started', 'Completed', 'Reviewed')),
    last_updated DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Job description content and versions
CREATE TABLE job_descriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id INT FOREIGN KEY REFERENCES jobs(id),
    version INT NOT NULL DEFAULT 1,
    job_summary NVARCHAR(MAX) NOT NULL,
    original_job_summary NVARCHAR(MAX),
    last_edited_by_id INT FOREIGN KEY REFERENCES users(id),
    last_updated_date DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Essential functions for job descriptions
CREATE TABLE essential_functions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_description_id INT FOREIGN KEY REFERENCES job_descriptions(id),
    function_text NVARCHAR(MAX) NOT NULL,
    sort_order INT NOT NULL,
    has_edit BIT DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Notifications system
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id),
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
    category NVARCHAR(50) NOT NULL,
    priority NVARCHAR(10) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    is_read BIT DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Dashboard summary metrics
CREATE TABLE dashboard_summary (
    id INT IDENTITY(1,1) PRIMARY KEY,
    total_users INT NOT NULL,
    revenue DECIMAL(12,2) NOT NULL,
    orders INT NOT NULL,
    growth_rate DECIMAL(5,2) NOT NULL,
    jobs_reviewed INT NOT NULL,
    in_progress INT NOT NULL,
    not_started INT NOT NULL,
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Transactions (for dashboard data)
CREATE TABLE transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_name NVARCHAR(255) NOT NULL,
    customer_email NVARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('Completed', 'Pending', 'Failed')),
    description NVARCHAR(MAX),
    date DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Reviewers (dashboard widget data)
CREATE TABLE reviewers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_family NVARCHAR(255) NOT NULL,
    completed INT NOT NULL,
    in_progress INT NOT NULL,
    responsible NVARCHAR(255) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Track changes for job description editing
CREATE TABLE job_description_changes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_description_id INT FOREIGN KEY REFERENCES job_descriptions(id),
    change_type NVARCHAR(20) NOT NULL CHECK (change_type IN ('insert', 'delete', 'update')),
    field_name NVARCHAR(100) NOT NULL,
    old_value NVARCHAR(MAX),
    new_value NVARCHAR(MAX),
    position INT,
    user_id INT FOREIGN KEY REFERENCES users(id),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Audit log for user actions
CREATE TABLE audit_log (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id),
    action NVARCHAR(100) NOT NULL,
    entity_type NVARCHAR(50) NOT NULL,
    entity_id INT,
    details NVARCHAR(MAX), -- JSON data
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_role ON users(role);
CREATE INDEX IX_users_status ON users(status);

-- Job families indexes
CREATE INDEX IX_job_families_name ON job_families(job_family);

-- Jobs indexes
CREATE INDEX IX_jobs_code ON jobs(job_code);
CREATE INDEX IX_jobs_status ON jobs(status);
CREATE INDEX IX_jobs_family_id ON jobs(job_family_id);
CREATE INDEX IX_jobs_reviewer_id ON jobs(reviewer_id);

-- Job descriptions indexes
CREATE INDEX IX_job_descriptions_job_id ON job_descriptions(job_id);
CREATE INDEX IX_job_descriptions_version ON job_descriptions(version);
CREATE INDEX IX_job_descriptions_active ON job_descriptions(is_active);

-- Essential functions indexes
CREATE INDEX IX_essential_functions_job_desc_id ON essential_functions(job_description_id);
CREATE INDEX IX_essential_functions_sort_order ON essential_functions(sort_order);

-- Notifications indexes
CREATE INDEX IX_notifications_user_id ON notifications(user_id);
CREATE INDEX IX_notifications_type ON notifications(type);
CREATE INDEX IX_notifications_read ON notifications(is_read);

-- Transactions indexes
CREATE INDEX IX_transactions_status ON transactions(status);
CREATE INDEX IX_transactions_date ON transactions(date);

-- Changes indexes
CREATE INDEX IX_job_description_changes_job_desc_id ON job_description_changes(job_description_id);
CREATE INDEX IX_job_description_changes_user_id ON job_description_changes(user_id);

-- Audit log indexes
CREATE INDEX IX_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IX_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX IX_audit_log_created_at ON audit_log(created_at);

-- =============================================
-- CREATE TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

-- Users trigger
CREATE TRIGGER tr_users_updated_at
ON users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE users 
    SET updated_at = GETUTCDATE() 
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

-- Job families trigger
CREATE TRIGGER tr_job_families_updated_at
ON job_families
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE job_families 
    SET updated_at = GETUTCDATE() 
    FROM job_families jf
    INNER JOIN inserted i ON jf.id = i.id;
END;
GO

-- Jobs trigger
CREATE TRIGGER tr_jobs_updated_at
ON jobs
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE jobs 
    SET updated_at = GETUTCDATE(), last_updated = GETUTCDATE()
    FROM jobs j
    INNER JOIN inserted i ON j.id = i.id;
END;
GO

-- Job descriptions trigger
CREATE TRIGGER tr_job_descriptions_updated_at
ON job_descriptions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE job_descriptions 
    SET updated_at = GETUTCDATE(), last_updated_date = GETUTCDATE()
    FROM job_descriptions jd
    INNER JOIN inserted i ON jd.id = i.id;
END;
GO

-- Essential functions trigger
CREATE TRIGGER tr_essential_functions_updated_at
ON essential_functions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE essential_functions 
    SET updated_at = GETUTCDATE() 
    FROM essential_functions ef
    INNER JOIN inserted i ON ef.id = i.id;
END;
GO

-- Notifications trigger
CREATE TRIGGER tr_notifications_updated_at
ON notifications
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE notifications 
    SET updated_at = GETUTCDATE() 
    FROM notifications n
    INNER JOIN inserted i ON n.id = i.id;
END;
GO

-- Reviewers trigger
CREATE TRIGGER tr_reviewers_updated_at
ON reviewers
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE reviewers 
    SET updated_at = GETUTCDATE() 
    FROM reviewers r
    INNER JOIN inserted i ON r.id = i.id;
END;
GO

PRINT 'Database schema created successfully!';