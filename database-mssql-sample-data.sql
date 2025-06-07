-- Job Management System - Microsoft SQL Server Sample Data
-- Created: 2025-06-07
-- Description: Sample data for development and testing

-- Clear existing data (in reverse dependency order)
DELETE FROM audit_log;
DELETE FROM job_description_changes;
DELETE FROM essential_functions;
DELETE FROM job_descriptions;
DELETE FROM jobs;
DELETE FROM notifications;
DELETE FROM reviewers;
DELETE FROM transactions;
DELETE FROM dashboard_summary;
DELETE FROM job_families;
DELETE FROM users;

-- Reset identity seeds
DBCC CHECKIDENT ('users', RESEED, 0);
DBCC CHECKIDENT ('job_families', RESEED, 0);
DBCC CHECKIDENT ('jobs', RESEED, 0);
DBCC CHECKIDENT ('job_descriptions', RESEED, 0);
DBCC CHECKIDENT ('essential_functions', RESEED, 0);
DBCC CHECKIDENT ('notifications', RESEED, 0);
DBCC CHECKIDENT ('dashboard_summary', RESEED, 0);
DBCC CHECKIDENT ('transactions', RESEED, 0);
DBCC CHECKIDENT ('reviewers', RESEED, 0);
DBCC CHECKIDENT ('job_description_changes', RESEED, 0);
DBCC CHECKIDENT ('audit_log', RESEED, 0);

-- Insert sample users
INSERT INTO users (name, email, role, department, status, last_login) VALUES
(N'John Smith', N'john.smith@company.com', N'Admin', N'Human Resources', N'Active', DATEADD(HOUR, -2, GETDATE())),
(N'Kelly Johnson', N'kelly.johnson@company.com', N'HR Manager', N'Human Resources', N'Active', DATEADD(DAY, -1, GETDATE())),
(N'Sarah Mitchell', N'sarah.mitchell@company.com', N'Reviewer', N'Clinical Operations', N'Active', DATEADD(HOUR, -3, GETDATE())),
(N'Robert Kennedy', N'robert.kennedy@company.com', N'Reviewer', N'Nursing', N'Active', DATEADD(DAY, -1, GETDATE())),
(N'Adam Lambert', N'adam.lambert@company.com', N'Reviewer', N'Finance', N'Active', DATEADD(DAY, -2, GETDATE())),
(N'Jennifer Williams', N'jennifer.williams@company.com', N'Reviewer', N'Clinical Support', N'Active', DATEADD(HOUR, -4, GETDATE())),
(N'Michael Roberts', N'michael.roberts@company.com', N'Reviewer', N'Human Resources', N'Active', DATEADD(DAY, -1, GETDATE())),
(N'Linda Taylor', N'linda.taylor@company.com', N'Reviewer', N'IT Services', N'Active', DATEADD(HOUR, -6, GETDATE())),
(N'David Phillips', N'david.phillips@company.com', N'Reviewer', N'IT Services', N'Active', DATEADD(DAY, -3, GETDATE())),
(N'Emma Sullivan', N'emma.sullivan@company.com', N'Employee', N'IT Services', N'Active', DATEADD(DAY, -1, GETDATE())),
(N'Chris Harrison', N'chris.harrison@company.com', N'Reviewer', N'Pharmacy', N'Active', DATEADD(DAY, -2, GETDATE())),
(N'Jennifer Collins', N'jennifer.collins@company.com', N'Employee', N'Clinical Support', N'Active', DATEADD(HOUR, -5, GETDATE())),
(N'Robert Wilson', N'robert.wilson@company.com', N'Employee', N'Clinical Support', N'Active', DATEADD(DAY, -1, GETDATE())),
(N'David Thompson', N'david.thompson@company.com', N'Employee', N'Revenue Cycle', N'Active', DATEADD(DAY, -2, GETDATE())),
(N'Susan Davis', N'susan.davis@company.com', N'Employee', N'Finance', N'Active', DATEADD(HOUR, -3, GETDATE()));

-- Insert job families
INSERT INTO job_families (job_family, total_jobs, jobs_reviewed, description) VALUES
(N'Clinical Support', 185, 145, N'Healthcare and clinical support roles'),
(N'Revenue Cycle', 95, 60, N'Revenue cycle and billing positions'),
(N'Finance', 120, 85, N'Financial management and accounting positions'),
(N'Human Resources', 78, 52, N'HR and talent management roles'),
(N'IT Services', 145, 98, N'IT and technology support positions'),
(N'Pharmacy', 45, 38, N'Pharmacy and pharmaceutical roles'),
(N'Lab Services', 62, 48, N'Laboratory and diagnostic services'),
(N'Behavioral Health', 38, 25, N'Mental health and behavioral services'),
(N'Security', 25, 20, N'Security and safety positions'),
(N'Quality', 42, 35, N'Quality assurance and control roles'),
(N'Nutrition', 28, 22, N'Nutrition and dietary services'),
(N'Facilities', 55, 42, N'Facilities and maintenance roles'),
(N'Patient Access', 35, 28, N'Patient registration and access services'),
(N'Health Information', 30, 24, N'Health information management'),
(N'Spiritual Care', 15, 12, N'Chaplaincy and spiritual services'),
(N'Patient Support', 22, 18, N'Patient transport and support services'),
(N'Leadership', 18, 15, N'Executive and management positions'),
(N'Legal', 12, 10, N'Legal and compliance roles'),
(N'Nursing', 220, 180, N'Nursing and patient care positions');

-- Insert sample jobs
INSERT INTO jobs (job_code, job_title, job_family_id, reviewer_id, responsible_id, status, last_updated) VALUES
(N'10001', N'Patient Care Technician', 1, 3, 12, N'Submitted to HR', DATEADD(DAY, -2, GETDATE())),
(N'10002', N'Radiology Tech', 1, 2, 13, N'Submitted to HR', DATEADD(DAY, -5, GETDATE())),
(N'10003', N'Billing Specialist', 2, 4, 14, N'Reviewed', DATEADD(DAY, -3, GETDATE())),
(N'10004', N'Financial Analyst', 3, 5, 15, N'In Progress', DATEADD(DAY, -1, GETDATE())),
(N'10005', N'Nurse Practitioner', 1, 6, 12, N'In Progress', DATEADD(DAY, -4, GETDATE())),
(N'10006', N'HR Generalist', 4, 7, 13, N'Not Started', DATEADD(DAY, -6, GETDATE())),
(N'10007', N'IT Support Technician', 5, 8, 10, N'Completed', DATEADD(DAY, -1, GETDATE())),
(N'10008', N'Pharmacist', 6, 11, 14, N'In Progress', DATEADD(DAY, -2, GETDATE())),
(N'10009', N'Lab Technician', 7, 4, 15, N'Reviewed', DATEADD(DAY, -3, GETDATE())),
(N'10010', N'Security Officer', 9, 7, 12, N'Not Started', DATEADD(DAY, -7, GETDATE())),
(N'10011', N'Quality Coordinator', 10, 5, 13, N'In Progress', DATEADD(DAY, -2, GETDATE())),
(N'10012', N'Nutritionist', 11, 6, 14, N'Completed', DATEADD(DAY, -5, GETDATE()));

-- Insert job descriptions
INSERT INTO job_descriptions (job_id, version, job_summary, original_job_summary, last_edited_by_id, is_active) VALUES
(1, 1, N'Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.', N'Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.', 3, 1),
(2, 1, N'Performs diagnostic imaging procedures using specialized equipment to assist in patient diagnosis and treatment.', N'Performs diagnostic imaging procedures using specialized equipment to assist in patient diagnosis and treatment.', 2, 1),
(3, 1, N'Processes medical billing and insurance claims, ensuring accurate coding and timely submission for reimbursement.', N'Processes medical billing and insurance claims, ensuring accurate coding and timely submission for reimbursement.', 4, 1),
(4, 1, N'Analyzes financial data and creates reports to support business decision-making and financial planning.', N'Analyzes financial data and creates reports to support business decision-making and financial planning.', 5, 1),
(5, 1, N'Provides advanced nursing care, conducts assessments, and collaborates with physicians to develop treatment plans.', N'Provides advanced nursing care, conducts assessments, and collaborates with physicians to develop treatment plans.', 6, 1),
(6, 1, N'Supports HR operations including recruitment, employee relations, and policy implementation.', N'Supports HR operations including recruitment, employee relations, and policy implementation.', 7, 1),
(7, 1, N'Provides technical support for computer systems, networks, and software applications.', N'Provides technical support for computer systems, networks, and software applications.', 8, 1),
(8, 1, N'Dispenses medications, provides patient counseling, and ensures compliance with pharmaceutical regulations.', N'Dispenses medications, provides patient counseling, and ensures compliance with pharmaceutical regulations.', 11, 1),
(9, 1, N'Performs laboratory tests and analyses to support patient diagnosis and treatment monitoring.', N'Performs laboratory tests and analyses to support patient diagnosis and treatment monitoring.', 4, 1),
(10, 1, N'Maintains facility security and safety through patrols, monitoring, and emergency response.', N'Maintains facility security and safety through patrols, monitoring, and emergency response.', 7, 1),
(11, 1, N'Coordinates quality improvement initiatives and ensures compliance with regulatory standards.', N'Coordinates quality improvement initiatives and ensures compliance with regulatory standards.', 5, 1),
(12, 1, N'Develops nutrition plans and provides dietary counseling to support patient health outcomes.', N'Develops nutrition plans and provides dietary counseling to support patient health outcomes.', 6, 1);

-- Insert essential functions
INSERT INTO essential_functions (job_description_id, function_text, sort_order, has_edit) VALUES
-- Patient Care Technician functions
(1, N'Record Vital Signs And Immediately Escalate Critical Values', 1, 1),
(1, N'Aid With Patient Hygiene And Nutritional Needs', 2, 1),
(1, N'Maintain Patient Care Logs And Coordinate With Nursing Staff', 3, 1),
(1, N'Support Safe Patient Transport Within The Facility', 4, 1),

-- Radiology Tech functions
(2, N'Operate diagnostic imaging equipment safely and effectively', 1, 1),
(2, N'Position patients appropriately for optimal image quality', 2, 1),
(2, N'Maintain equipment calibration and quality control standards', 3, 1),
(2, N'Ensure radiation safety protocols are followed', 4, 1),

-- Billing Specialist functions
(3, N'Review and process medical billing claims accurately', 1, 1),
(3, N'Verify insurance coverage and obtain prior authorizations', 2, 1),
(3, N'Follow up on denied or rejected claims', 3, 1),
(3, N'Maintain patient billing records and documentation', 4, 1),

-- Financial Analyst functions
(4, N'Prepare monthly and quarterly financial reports', 1, 1),
(4, N'Analyze budget variances and identify trends', 2, 1),
(4, N'Support annual budgeting and forecasting processes', 3, 1),
(4, N'Conduct financial modeling and scenario analysis', 4, 1);

-- Insert notifications
INSERT INTO notifications (user_id, title, message, type, category, priority, is_read) VALUES
(1, N'System Maintenance', N'Scheduled system maintenance will occur this weekend', N'info', N'system', N'medium', 0),
(2, N'Job Submitted for Review', N'Job 10001 has been submitted for your review', N'info', N'job_status', N'high', 0),
(3, N'Review Deadline Approaching', N'Job 10005 review deadline is in 2 days', N'warning', N'deadline', N'high', 0),
(4, N'Job Completed', N'Job 10007 has been completed successfully', N'success', N'job_status', N'medium', 1),
(5, N'New Job Assignment', N'You have been assigned as reviewer for job 10004', N'info', N'assignment', N'medium', 0);

-- Insert dashboard summary
INSERT INTO dashboard_summary (total_users, revenue, orders, growth_rate, jobs_reviewed, in_progress, not_started) VALUES
(9000, 75000.00, 1250, 12.5, 823, 345, 156);

-- Insert sample transactions
INSERT INTO transactions (customer_name, customer_email, amount, status, description) VALUES
(N'Sarah Miller', N'sarah.miller@email.com', 1250.00, N'Completed', N'Monthly service subscription'),
(N'John Davis', N'john.davis@email.com', 850.50, N'Completed', N'Professional services consultation'),
(N'Emily Chen', N'emily.chen@email.com', 2100.00, N'Pending', N'Annual maintenance contract'),
(N'Michael Brown', N'michael.brown@email.com', 750.00, N'Completed', N'Training program enrollment'),
(N'Lisa Johnson', N'lisa.johnson@email.com', 1500.00, N'Failed', N'Equipment purchase order'),
(N'David Wilson', N'david.wilson@email.com', 950.00, N'Completed', N'Software licensing renewal'),
(N'Anna Rodriguez', N'anna.rodriguez@email.com', 1800.00, N'Completed', N'Implementation services'),
(N'James Thompson', N'james.thompson@email.com', 650.00, N'Pending', N'Support ticket resolution');

-- Insert reviewers data
INSERT INTO reviewers (username, full_name, email, job_family, completed, in_progress, responsible) VALUES
(N'sarah.mitchell', N'Sarah Mitchell', N'sarah.mitchell@company.com', N'Clinical Support', 45, 8, N'Jennifer Collins'),
(N'kelly.johnson', N'Kelly Johnson', N'kelly.johnson@company.com', N'Revenue Cycle', 38, 12, N'Robert Wilson'),
(N'robert.kennedy', N'Robert Kennedy', N'robert.kennedy@company.com', N'Nursing', 52, 6, N'David Thompson'),
(N'adam.lambert', N'Adam Lambert', N'adam.lambert@company.com', N'Finance', 41, 9, N'Susan Davis'),
(N'jennifer.williams', N'Jennifer Williams', N'jennifer.williams@company.com', N'Clinical Support', 36, 11, N'Jennifer Collins'),
(N'michael.roberts', N'Michael Roberts', N'michael.roberts@company.com', N'Human Resources', 29, 7, N'Robert Wilson'),
(N'linda.taylor', N'Linda Taylor', N'linda.taylor@company.com', N'IT Services', 33, 14, N'Emma Sullivan'),
(N'david.phillips', N'David Phillips', N'david.phillips@company.com', N'IT Services', 28, 5, N'Emma Sullivan');

-- Insert job description changes for tracking
INSERT INTO job_description_changes (job_description_id, change_type, field_name, old_value, new_value, user_id) VALUES
(1, N'update', N'job_summary', N'Original patient care description', N'Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.', 3),
(2, N'update', N'job_summary', N'Basic radiology tech role', N'Performs diagnostic imaging procedures using specialized equipment to assist in patient diagnosis and treatment.', 2),
(4, N'insert', N'essential_function', NULL, N'Conduct financial modeling and scenario analysis', 5);

-- Insert audit log entries
INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES
(1, N'CREATE', N'job', 1, N'{"job_code":"10001","job_title":"Patient Care Technician"}', N'192.168.1.100', N'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(3, N'UPDATE', N'job_description', 1, N'{"version":1}', N'192.168.1.101', N'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, N'STATUS_CHANGE', N'job', 1, N'{"old_status":"In Progress","new_status":"Submitted to HR"}', N'192.168.1.102', N'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(5, N'CREATE', N'essential_function', 13, N'{"job_description_id":4,"function_text":"Conduct financial modeling and scenario analysis"}', N'192.168.1.103', N'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(7, N'UPDATE', N'job', 6, N'{"status":"Not Started"}', N'192.168.1.104', N'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- Verify data insertion
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Job Families', COUNT(*) FROM job_families
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'Job Descriptions', COUNT(*) FROM job_descriptions
UNION ALL
SELECT 'Essential Functions', COUNT(*) FROM essential_functions
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Reviewers', COUNT(*) FROM reviewers
UNION ALL
SELECT 'Job Description Changes', COUNT(*) FROM job_description_changes
UNION ALL
SELECT 'Audit Log', COUNT(*) FROM audit_log
ORDER BY table_name;