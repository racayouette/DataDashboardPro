-- Job Management System - Microsoft SQL Server Database Schema
-- Created: 2025-06-07
-- Description: Complete database schema for the job description management platform

-- Drop existing tables in reverse dependency order
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

-- Create Users table for authentication and user management
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'HR Manager', 'Reviewer', 'Employee')),
    department NVARCHAR(255) NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Inactive')),
    last_login DATETIME2,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create Job Families table
CREATE TABLE job_families (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_family NVARCHAR(255) NOT NULL,
    total_jobs INT NOT NULL DEFAULT 0,
    jobs_reviewed INT NOT NULL DEFAULT 0,
    description NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create Jobs table
CREATE TABLE jobs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_code NVARCHAR(50) NOT NULL UNIQUE,
    job_title NVARCHAR(255) NOT NULL,
    job_family_id INT FOREIGN KEY REFERENCES job_families(id),
    reviewer_id INT FOREIGN KEY REFERENCES users(id),
    responsible_id INT FOREIGN KEY REFERENCES users(id),
    status NVARCHAR(50) NOT NULL CHECK (status IN ('In Progress', 'Not Started', 'Completed', 'Reviewed', 'Submitted to HR')),
    last_updated DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create Job Descriptions table
CREATE TABLE job_descriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id INT FOREIGN KEY REFERENCES jobs(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    job_summary NVARCHAR(MAX) NOT NULL,
    original_job_summary NVARCHAR(MAX),
    last_edited_by_id INT FOREIGN KEY REFERENCES users(id),
    last_updated_date DATETIME2 NOT NULL DEFAULT GETDATE(),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create Essential Functions table
CREATE TABLE essential_functions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_description_id INT FOREIGN KEY REFERENCES job_descriptions(id) ON DELETE CASCADE,
    function_text NVARCHAR(MAX) NOT NULL,
    sort_order INT NOT NULL,
    has_edit BIT DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create Notifications table
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
    category NVARCHAR(50) NOT NULL,
    priority NVARCHAR(20) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    is_read BIT DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create Dashboard Summary table
CREATE TABLE dashboard_summary (
    id INT IDENTITY(1,1) PRIMARY KEY,
    total_users INT NOT NULL,
    revenue DECIMAL(12, 2) NOT NULL,
    orders INT NOT NULL,
    growth_rate DECIMAL(5, 2) NOT NULL,
    jobs_reviewed INT NOT NULL,
    in_progress INT NOT NULL,
    not_started INT NOT NULL,
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create Transactions table (for dashboard data)
CREATE TABLE transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_name NVARCHAR(255) NOT NULL,
    customer_email NVARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('Completed', 'Pending', 'Failed')),
    description NVARCHAR(MAX),
    date DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create Reviewers table (dashboard widget data)
CREATE TABLE reviewers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255),
    full_name NVARCHAR(255),
    email NVARCHAR(255),
    job_family NVARCHAR(255) NOT NULL,
    completed INT NOT NULL DEFAULT 0,
    in_progress INT NOT NULL DEFAULT 0,
    responsible NVARCHAR(255) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create Job Description Changes table (track changes)
CREATE TABLE job_description_changes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_description_id INT FOREIGN KEY REFERENCES job_descriptions(id) ON DELETE CASCADE,
    change_type NVARCHAR(20) NOT NULL CHECK (change_type IN ('insert', 'delete', 'update')),
    field_name NVARCHAR(100) NOT NULL,
    old_value NVARCHAR(MAX),
    new_value NVARCHAR(MAX),
    position INT,
    user_id INT FOREIGN KEY REFERENCES users(id),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create Audit Log table
CREATE TABLE audit_log (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id),
    action NVARCHAR(100) NOT NULL,
    entity_type NVARCHAR(100) NOT NULL,
    entity_id INT,
    details NVARCHAR(MAX), -- JSON string for SQL Server versions without native JSON
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create indexes for performance
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_role ON users(role);
CREATE INDEX IX_users_status ON users(status);
CREATE INDEX IX_jobs_job_code ON jobs(job_code);
CREATE INDEX IX_jobs_status ON jobs(status);
CREATE INDEX IX_jobs_job_family_id ON jobs(job_family_id);
CREATE INDEX IX_jobs_reviewer_id ON jobs(reviewer_id);
CREATE INDEX IX_jobs_responsible_id ON jobs(responsible_id);
CREATE INDEX IX_job_descriptions_job_id ON job_descriptions(job_id);
CREATE INDEX IX_job_descriptions_is_active ON job_descriptions(is_active);
CREATE INDEX IX_essential_functions_job_description_id ON essential_functions(job_description_id);
CREATE INDEX IX_essential_functions_sort_order ON essential_functions(sort_order);
CREATE INDEX IX_notifications_user_id ON notifications(user_id);
CREATE INDEX IX_notifications_is_read ON notifications(is_read);
CREATE INDEX IX_notifications_type ON notifications(type);
CREATE INDEX IX_notifications_priority ON notifications(priority);
CREATE INDEX IX_job_description_changes_job_description_id ON job_description_changes(job_description_id);
CREATE INDEX IX_job_description_changes_user_id ON job_description_changes(user_id);
CREATE INDEX IX_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IX_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX IX_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IX_transactions_status ON transactions(status);
CREATE INDEX IX_transactions_date ON transactions(date);
CREATE INDEX IX_reviewers_job_family ON reviewers(job_family);

-- Create triggers for updated_at timestamps
-- Trigger for users table
CREATE TRIGGER TR_users_update_timestamp
ON users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE users 
    SET updated_at = GETDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END;

-- Trigger for job_families table
CREATE TRIGGER TR_job_families_update_timestamp
ON job_families
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE job_families 
    SET updated_at = GETDATE()
    FROM job_families jf
    INNER JOIN inserted i ON jf.id = i.id;
END;

-- Trigger for jobs table
CREATE TRIGGER TR_jobs_update_timestamp
ON jobs
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE jobs 
    SET updated_at = GETDATE()
    FROM jobs j
    INNER JOIN inserted i ON j.id = i.id;
END;

-- Trigger for job_descriptions table
CREATE TRIGGER TR_job_descriptions_update_timestamp
ON job_descriptions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE job_descriptions 
    SET updated_at = GETDATE()
    FROM job_descriptions jd
    INNER JOIN inserted i ON jd.id = i.id;
END;

-- Trigger for essential_functions table
CREATE TRIGGER TR_essential_functions_update_timestamp
ON essential_functions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE essential_functions 
    SET updated_at = GETDATE()
    FROM essential_functions ef
    INNER JOIN inserted i ON ef.id = i.id;
END;

-- Trigger for notifications table
CREATE TRIGGER TR_notifications_update_timestamp
ON notifications
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE notifications 
    SET updated_at = GETDATE()
    FROM notifications n
    INNER JOIN inserted i ON n.id = i.id;
END;

-- Trigger for reviewers table
CREATE TRIGGER TR_reviewers_update_timestamp
ON reviewers
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE reviewers 
    SET updated_at = GETDATE()
    FROM reviewers r
    INNER JOIN inserted i ON r.id = i.id;
END;

-- Add extended properties for documentation
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'User accounts for authentication and role management', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'users';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Job categories and families for organizing positions', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'job_families';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Individual job positions and their metadata', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'jobs';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Job description content with versioning support', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'job_descriptions';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Essential functions within job descriptions', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'essential_functions';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'System notifications for users', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'notifications';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Dashboard metrics and summary data', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'dashboard_summary';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Transaction data for dashboard widgets', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'transactions';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Reviewer information for dashboard widgets', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'reviewers';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Change tracking for job description editing', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'job_description_changes';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Comprehensive audit trail for all system actions', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'audit_log';

-- Column descriptions
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'User role: Admin, HR Manager, Reviewer, Employee', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'users',
    @level2type = N'Column', @level2name = 'role';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Account status: Active, Inactive', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'users',
    @level2type = N'Column', @level2name = 'status';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Job progress status: In Progress, Not Started, Completed, Reviewed, Submitted to HR', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'jobs',
    @level2type = N'Column', @level2name = 'status';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Notification type: info, warning, success, error', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'notifications',
    @level2type = N'Column', @level2name = 'type';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Priority level: high, medium, low', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'notifications',
    @level2type = N'Column', @level2name = 'priority';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Type of change: insert, delete, update', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'job_description_changes',
    @level2type = N'Column', @level2name = 'change_type';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Transaction status: Completed, Pending, Failed', 
    @level0type = N'Schema', @level0name = 'dbo', 
    @level1type = N'Table', @level1name = 'transactions',
    @level2type = N'Column', @level2name = 'status';