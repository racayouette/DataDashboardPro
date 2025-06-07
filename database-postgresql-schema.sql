-- Job Management System - PostgreSQL Database Schema
-- Created: 2025-06-07
-- Description: Complete database schema for the job description management platform

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS job_description_changes CASCADE;
DROP TABLE IF EXISTS essential_functions CASCADE;
DROP TABLE IF EXISTS job_descriptions CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviewers CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS dashboard_summary CASCADE;
DROP TABLE IF EXISTS job_families CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table for authentication and user management
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'HR Manager', 'Reviewer', 'Employee')),
    department TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')),
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Job Families table
CREATE TABLE job_families (
    id SERIAL PRIMARY KEY,
    job_family TEXT NOT NULL,
    total_jobs INTEGER NOT NULL DEFAULT 0,
    jobs_reviewed INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    job_code TEXT NOT NULL UNIQUE,
    job_title TEXT NOT NULL,
    job_family_id INTEGER REFERENCES job_families(id) ON DELETE SET NULL,
    reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    responsible_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('In Progress', 'Not Started', 'Completed', 'Reviewed', 'Submitted to HR')),
    last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Job Descriptions table
CREATE TABLE job_descriptions (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    job_summary TEXT NOT NULL,
    original_job_summary TEXT,
    last_edited_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    last_updated_date TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Essential Functions table
CREATE TABLE essential_functions (
    id SERIAL PRIMARY KEY,
    job_description_id INTEGER REFERENCES job_descriptions(id) ON DELETE CASCADE,
    function_text TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    has_edit BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
    category TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Dashboard Summary table
CREATE TABLE dashboard_summary (
    id SERIAL PRIMARY KEY,
    total_users INTEGER NOT NULL,
    revenue DECIMAL(12, 2) NOT NULL,
    orders INTEGER NOT NULL,
    growth_rate DECIMAL(5, 2) NOT NULL,
    jobs_reviewed INTEGER NOT NULL,
    in_progress INTEGER NOT NULL,
    not_started INTEGER NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Transactions table (for dashboard data)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Completed', 'Pending', 'Failed')),
    description TEXT,
    date TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Reviewers table (dashboard widget data)
CREATE TABLE reviewers (
    id SERIAL PRIMARY KEY,
    username TEXT,
    full_name TEXT,
    email TEXT,
    job_family TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    in_progress INTEGER NOT NULL DEFAULT 0,
    responsible TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Job Description Changes table (track changes)
CREATE TABLE job_description_changes (
    id SERIAL PRIMARY KEY,
    job_description_id INTEGER REFERENCES job_descriptions(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('insert', 'delete', 'update')),
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    position INTEGER,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Audit Log table
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_jobs_job_code ON jobs(job_code);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_job_family_id ON jobs(job_family_id);
CREATE INDEX idx_jobs_reviewer_id ON jobs(reviewer_id);
CREATE INDEX idx_jobs_responsible_id ON jobs(responsible_id);
CREATE INDEX idx_job_descriptions_job_id ON job_descriptions(job_id);
CREATE INDEX idx_job_descriptions_is_active ON job_descriptions(is_active);
CREATE INDEX idx_essential_functions_job_description_id ON essential_functions(job_description_id);
CREATE INDEX idx_essential_functions_sort_order ON essential_functions(sort_order);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_job_description_changes_job_description_id ON job_description_changes(job_description_id);
CREATE INDEX idx_job_description_changes_user_id ON job_description_changes(user_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_reviewers_job_family ON reviewers(job_family);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_families_updated_at BEFORE UPDATE ON job_families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_descriptions_updated_at BEFORE UPDATE ON job_descriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_essential_functions_updated_at BEFORE UPDATE ON essential_functions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviewers_updated_at BEFORE UPDATE ON reviewers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for authentication and role management';
COMMENT ON TABLE job_families IS 'Job categories and families for organizing positions';
COMMENT ON TABLE jobs IS 'Individual job positions and their metadata';
COMMENT ON TABLE job_descriptions IS 'Job description content with versioning support';
COMMENT ON TABLE essential_functions IS 'Essential functions within job descriptions';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE dashboard_summary IS 'Dashboard metrics and summary data';
COMMENT ON TABLE transactions IS 'Transaction data for dashboard widgets';
COMMENT ON TABLE reviewers IS 'Reviewer information for dashboard widgets';
COMMENT ON TABLE job_description_changes IS 'Change tracking for job description editing';
COMMENT ON TABLE audit_log IS 'Comprehensive audit trail for all system actions';

COMMENT ON COLUMN users.role IS 'User role: Admin, HR Manager, Reviewer, Employee';
COMMENT ON COLUMN users.status IS 'Account status: Active, Inactive';
COMMENT ON COLUMN jobs.status IS 'Job progress status: In Progress, Not Started, Completed, Reviewed, Submitted to HR';
COMMENT ON COLUMN notifications.type IS 'Notification type: info, warning, success, error';
COMMENT ON COLUMN notifications.priority IS 'Priority level: high, medium, low';
COMMENT ON COLUMN job_description_changes.change_type IS 'Type of change: insert, delete, update';
COMMENT ON COLUMN transactions.status IS 'Transaction status: Completed, Pending, Failed';