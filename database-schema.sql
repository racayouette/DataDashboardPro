-- Job Management Dashboard - Microsoft SQL Server Schema
-- Complete database schema with all tables and relationships

-- Users table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    full_name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'user',
    department NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Job Families table
CREATE TABLE job_families (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_family NVARCHAR(255) NOT NULL,
    total_jobs INT NOT NULL DEFAULT 0,
    jobs_reviewed INT NOT NULL DEFAULT 0,
    description NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Jobs table
CREATE TABLE jobs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_code NVARCHAR(50) NOT NULL UNIQUE,
    job_title NVARCHAR(255) NOT NULL,
    job_family_id INT NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'draft',
    reviewer_id INT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (job_family_id) REFERENCES job_families(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- Job Descriptions table
CREATE TABLE job_descriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id INT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    job_summary NVARCHAR(MAX),
    is_active BIT NOT NULL DEFAULT 0,
    created_by INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Essential Functions table
CREATE TABLE essential_functions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_description_id INT NOT NULL,
    function_text NVARCHAR(MAX) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (job_description_id) REFERENCES job_descriptions(id)
);

-- Notifications table
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(50) NOT NULL DEFAULT 'info',
    is_read BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Dashboard Summary table
CREATE TABLE dashboard_summary (
    id INT IDENTITY(1,1) PRIMARY KEY,
    total_users INT NOT NULL,
    revenue NVARCHAR(50) NOT NULL,
    orders INT NOT NULL,
    growth_rate NVARCHAR(10) NOT NULL,
    jobs_reviewed INT NOT NULL DEFAULT 0,
    in_progress INT NOT NULL DEFAULT 0,
    not_started INT NOT NULL DEFAULT 0,
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Transactions table
CREATE TABLE transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_name NVARCHAR(255) NOT NULL,
    customer_email NVARCHAR(255) NOT NULL,
    amount NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX),
    date DATETIME2 DEFAULT GETDATE()
);

-- Reviewers table
CREATE TABLE reviewers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_family NVARCHAR(255) NOT NULL,
    completed INT NOT NULL DEFAULT 0,
    in_progress INT NOT NULL DEFAULT 0,
    responsible NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Job Description Changes table (for track changes)
CREATE TABLE job_description_changes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_description_id INT NOT NULL,
    change_type NVARCHAR(50) NOT NULL, -- 'insert', 'delete', 'modify'
    field_name NVARCHAR(100) NOT NULL,
    old_value NVARCHAR(MAX),
    new_value NVARCHAR(MAX),
    changed_by INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (job_description_id) REFERENCES job_descriptions(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Audit Log table
CREATE TABLE audit_log (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    action NVARCHAR(100) NOT NULL,
    table_name NVARCHAR(100) NOT NULL,
    record_id INT,
    old_values NVARCHAR(MAX),
    new_values NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IX_jobs_job_family_id ON jobs(job_family_id);
CREATE INDEX IX_jobs_reviewer_id ON jobs(reviewer_id);
CREATE INDEX IX_job_descriptions_job_id ON job_descriptions(job_id);
CREATE INDEX IX_essential_functions_job_description_id ON essential_functions(job_description_id);
CREATE INDEX IX_notifications_user_id ON notifications(user_id);
CREATE INDEX IX_job_description_changes_job_description_id ON job_description_changes(job_description_id);
CREATE INDEX IX_audit_log_user_id ON audit_log(user_id);