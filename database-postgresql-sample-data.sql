-- Job Management System - PostgreSQL Sample Data
-- Created: 2025-06-07
-- Description: Sample data for development and testing

-- Clear existing data (in reverse dependency order)
TRUNCATE TABLE audit_log RESTART IDENTITY CASCADE;
TRUNCATE TABLE job_description_changes RESTART IDENTITY CASCADE;
TRUNCATE TABLE essential_functions RESTART IDENTITY CASCADE;
TRUNCATE TABLE job_descriptions RESTART IDENTITY CASCADE;
TRUNCATE TABLE jobs RESTART IDENTITY CASCADE;
TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;
TRUNCATE TABLE reviewers RESTART IDENTITY CASCADE;
TRUNCATE TABLE transactions RESTART IDENTITY CASCADE;
TRUNCATE TABLE dashboard_summary RESTART IDENTITY CASCADE;
TRUNCATE TABLE job_families RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Insert sample users
INSERT INTO users (name, email, role, department, status, last_login) VALUES
('John Smith', 'john.smith@company.com', 'Admin', 'Human Resources', 'Active', NOW() - INTERVAL '2 hours'),
('Kelly Johnson', 'kelly.johnson@company.com', 'HR Manager', 'Human Resources', 'Active', NOW() - INTERVAL '1 day'),
('Sarah Mitchell', 'sarah.mitchell@company.com', 'Reviewer', 'Clinical Operations', 'Active', NOW() - INTERVAL '3 hours'),
('Robert Kennedy', 'robert.kennedy@company.com', 'Reviewer', 'Nursing', 'Active', NOW() - INTERVAL '1 day'),
('Adam Lambert', 'adam.lambert@company.com', 'Reviewer', 'Finance', 'Active', NOW() - INTERVAL '2 days'),
('Jennifer Williams', 'jennifer.williams@company.com', 'Reviewer', 'Clinical Support', 'Active', NOW() - INTERVAL '4 hours'),
('Michael Roberts', 'michael.roberts@company.com', 'Reviewer', 'Human Resources', 'Active', NOW() - INTERVAL '1 day'),
('Linda Taylor', 'linda.taylor@company.com', 'Reviewer', 'IT Services', 'Active', NOW() - INTERVAL '6 hours'),
('David Phillips', 'david.phillips@company.com', 'Reviewer', 'IT Services', 'Active', NOW() - INTERVAL '3 days'),
('Emma Sullivan', 'emma.sullivan@company.com', 'Employee', 'IT Services', 'Active', NOW() - INTERVAL '1 day'),
('Chris Harrison', 'chris.harrison@company.com', 'Reviewer', 'Pharmacy', 'Active', NOW() - INTERVAL '2 days'),
('Jennifer Collins', 'jennifer.collins@company.com', 'Employee', 'Clinical Support', 'Active', NOW() - INTERVAL '5 hours'),
('Robert Wilson', 'robert.wilson@company.com', 'Employee', 'Clinical Support', 'Active', NOW() - INTERVAL '1 day'),
('David Thompson', 'david.thompson@company.com', 'Employee', 'Revenue Cycle', 'Active', NOW() - INTERVAL '2 days'),
('Susan Davis', 'susan.davis@company.com', 'Employee', 'Finance', 'Active', NOW() - INTERVAL '3 hours');

-- Insert job families
INSERT INTO job_families (job_family, total_jobs, jobs_reviewed, description) VALUES
('Clinical Support', 185, 145, 'Healthcare and clinical support roles'),
('Revenue Cycle', 95, 60, 'Revenue cycle and billing positions'),
('Finance', 120, 85, 'Financial management and accounting positions'),
('Human Resources', 78, 52, 'HR and talent management roles'),
('IT Services', 145, 98, 'IT and technology support positions'),
('Pharmacy', 45, 38, 'Pharmacy and pharmaceutical roles'),
('Lab Services', 62, 48, 'Laboratory and diagnostic services'),
('Behavioral Health', 38, 25, 'Mental health and behavioral services'),
('Security', 25, 20, 'Security and safety positions'),
('Quality', 42, 35, 'Quality assurance and control roles'),
('Nutrition', 28, 22, 'Nutrition and dietary services'),
('Facilities', 55, 42, 'Facilities and maintenance roles'),
('Patient Access', 35, 28, 'Patient registration and access services'),
('Health Information', 30, 24, 'Health information management'),
('Spiritual Care', 15, 12, 'Chaplaincy and spiritual services'),
('Patient Support', 22, 18, 'Patient transport and support services'),
('Leadership', 18, 15, 'Executive and management positions'),
('Legal', 12, 10, 'Legal and compliance roles'),
('Nursing', 220, 180, 'Nursing and patient care positions');

-- Insert sample jobs
INSERT INTO jobs (job_code, job_title, job_family_id, reviewer_id, responsible_id, status, last_updated) VALUES
('10001', 'Patient Care Technician', 1, 3, 12, 'Submitted to HR', NOW() - INTERVAL '2 days'),
('10002', 'Radiology Tech', 1, 2, 13, 'Submitted to HR', NOW() - INTERVAL '5 days'),
('10003', 'Billing Specialist', 2, 4, 14, 'Reviewed', NOW() - INTERVAL '3 days'),
('10004', 'Financial Analyst', 3, 5, 15, 'In Progress', NOW() - INTERVAL '1 day'),
('10005', 'Nurse Practitioner', 1, 6, 12, 'In Progress', NOW() - INTERVAL '4 days'),
('10006', 'HR Generalist', 4, 7, 13, 'Not Started', NOW() - INTERVAL '6 days'),
('10007', 'IT Support Technician', 5, 8, 10, 'Completed', NOW() - INTERVAL '1 day'),
('10008', 'Pharmacist', 6, 11, 14, 'In Progress', NOW() - INTERVAL '2 days'),
('10009', 'Lab Technician', 7, 4, 15, 'Reviewed', NOW() - INTERVAL '3 days'),
('10010', 'Security Officer', 9, 7, 12, 'Not Started', NOW() - INTERVAL '1 week'),
('10011', 'Quality Coordinator', 10, 5, 13, 'In Progress', NOW() - INTERVAL '2 days'),
('10012', 'Nutritionist', 11, 6, 14, 'Completed', NOW() - INTERVAL '5 days');

-- Insert job descriptions
INSERT INTO job_descriptions (job_id, version, job_summary, original_job_summary, last_edited_by_id, is_active) VALUES
(1, 1, 'Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.', 'Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.', 3, TRUE),
(2, 1, 'Performs diagnostic imaging procedures using specialized equipment to assist in patient diagnosis and treatment.', 'Performs diagnostic imaging procedures using specialized equipment to assist in patient diagnosis and treatment.', 2, TRUE),
(3, 1, 'Processes medical billing and insurance claims, ensuring accurate coding and timely submission for reimbursement.', 'Processes medical billing and insurance claims, ensuring accurate coding and timely submission for reimbursement.', 4, TRUE),
(4, 1, 'Analyzes financial data and creates reports to support business decision-making and financial planning.', 'Analyzes financial data and creates reports to support business decision-making and financial planning.', 5, TRUE),
(5, 1, 'Provides advanced nursing care, conducts assessments, and collaborates with physicians to develop treatment plans.', 'Provides advanced nursing care, conducts assessments, and collaborates with physicians to develop treatment plans.', 6, TRUE),
(6, 1, 'Supports HR operations including recruitment, employee relations, and policy implementation.', 'Supports HR operations including recruitment, employee relations, and policy implementation.', 7, TRUE),
(7, 1, 'Provides technical support for computer systems, networks, and software applications.', 'Provides technical support for computer systems, networks, and software applications.', 8, TRUE),
(8, 1, 'Dispenses medications, provides patient counseling, and ensures compliance with pharmaceutical regulations.', 'Dispenses medications, provides patient counseling, and ensures compliance with pharmaceutical regulations.', 11, TRUE),
(9, 1, 'Performs laboratory tests and analyses to support patient diagnosis and treatment monitoring.', 'Performs laboratory tests and analyses to support patient diagnosis and treatment monitoring.', 4, TRUE),
(10, 1, 'Maintains facility security and safety through patrols, monitoring, and emergency response.', 'Maintains facility security and safety through patrols, monitoring, and emergency response.', 7, TRUE),
(11, 1, 'Coordinates quality improvement initiatives and ensures compliance with regulatory standards.', 'Coordinates quality improvement initiatives and ensures compliance with regulatory standards.', 5, TRUE),
(12, 1, 'Develops nutrition plans and provides dietary counseling to support patient health outcomes.', 'Develops nutrition plans and provides dietary counseling to support patient health outcomes.', 6, TRUE);

-- Insert essential functions
INSERT INTO essential_functions (job_description_id, function_text, sort_order, has_edit) VALUES
-- Patient Care Technician functions
(1, 'Record Vital Signs And Immediately Escalate Critical Values', 1, TRUE),
(1, 'Aid With Patient Hygiene And Nutritional Needs', 2, TRUE),
(1, 'Maintain Patient Care Logs And Coordinate With Nursing Staff', 3, TRUE),
(1, 'Support Safe Patient Transport Within The Facility', 4, TRUE),

-- Radiology Tech functions
(2, 'Operate diagnostic imaging equipment safely and effectively', 1, TRUE),
(2, 'Position patients appropriately for optimal image quality', 2, TRUE),
(2, 'Maintain equipment calibration and quality control standards', 3, TRUE),
(2, 'Ensure radiation safety protocols are followed', 4, TRUE),

-- Billing Specialist functions
(3, 'Review and process medical billing claims accurately', 1, TRUE),
(3, 'Verify insurance coverage and obtain prior authorizations', 2, TRUE),
(3, 'Follow up on denied or rejected claims', 3, TRUE),
(3, 'Maintain patient billing records and documentation', 4, TRUE),

-- Financial Analyst functions
(4, 'Prepare monthly and quarterly financial reports', 1, TRUE),
(4, 'Analyze budget variances and identify trends', 2, TRUE),
(4, 'Support annual budgeting and forecasting processes', 3, TRUE),
(4, 'Conduct financial modeling and scenario analysis', 4, TRUE);

-- Insert notifications
INSERT INTO notifications (user_id, title, message, type, category, priority, is_read) VALUES
(1, 'System Maintenance', 'Scheduled system maintenance will occur this weekend', 'info', 'system', 'medium', FALSE),
(2, 'Job Submitted for Review', 'Job 10001 has been submitted for your review', 'info', 'job_status', 'high', FALSE),
(3, 'Review Deadline Approaching', 'Job 10005 review deadline is in 2 days', 'warning', 'deadline', 'high', FALSE),
(4, 'Job Completed', 'Job 10007 has been completed successfully', 'success', 'job_status', 'medium', TRUE),
(5, 'New Job Assignment', 'You have been assigned as reviewer for job 10004', 'info', 'assignment', 'medium', FALSE);

-- Insert dashboard summary
INSERT INTO dashboard_summary (total_users, revenue, orders, growth_rate, jobs_reviewed, in_progress, not_started) VALUES
(9000, 75000.00, 1250, 12.5, 823, 345, 156);

-- Insert sample transactions
INSERT INTO transactions (customer_name, customer_email, amount, status, description) VALUES
('Sarah Miller', 'sarah.miller@email.com', 1250.00, 'Completed', 'Monthly service subscription'),
('John Davis', 'john.davis@email.com', 850.50, 'Completed', 'Professional services consultation'),
('Emily Chen', 'emily.chen@email.com', 2100.00, 'Pending', 'Annual maintenance contract'),
('Michael Brown', 'michael.brown@email.com', 750.00, 'Completed', 'Training program enrollment'),
('Lisa Johnson', 'lisa.johnson@email.com', 1500.00, 'Failed', 'Equipment purchase order'),
('David Wilson', 'david.wilson@email.com', 950.00, 'Completed', 'Software licensing renewal'),
('Anna Rodriguez', 'anna.rodriguez@email.com', 1800.00, 'Completed', 'Implementation services'),
('James Thompson', 'james.thompson@email.com', 650.00, 'Pending', 'Support ticket resolution');

-- Insert reviewers data
INSERT INTO reviewers (username, full_name, email, job_family, completed, in_progress, responsible) VALUES
('sarah.mitchell', 'Sarah Mitchell', 'sarah.mitchell@company.com', 'Clinical Support', 45, 8, 'Jennifer Collins'),
('kelly.johnson', 'Kelly Johnson', 'kelly.johnson@company.com', 'Revenue Cycle', 38, 12, 'Robert Wilson'),
('robert.kennedy', 'Robert Kennedy', 'robert.kennedy@company.com', 'Nursing', 52, 6, 'David Thompson'),
('adam.lambert', 'Adam Lambert', 'adam.lambert@company.com', 'Finance', 41, 9, 'Susan Davis'),
('jennifer.williams', 'Jennifer Williams', 'jennifer.williams@company.com', 'Clinical Support', 36, 11, 'Jennifer Collins'),
('michael.roberts', 'Michael Roberts', 'michael.roberts@company.com', 'Human Resources', 29, 7, 'Robert Wilson'),
('linda.taylor', 'Linda Taylor', 'linda.taylor@company.com', 'IT Services', 33, 14, 'Emma Sullivan'),
('david.phillips', 'david.phillips@company.com', 'David Phillips', 'IT Services', 28, 5, 'Emma Sullivan');

-- Insert job description changes for tracking
INSERT INTO job_description_changes (job_description_id, change_type, field_name, old_value, new_value, user_id) VALUES
(1, 'update', 'job_summary', 'Original patient care description', 'Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.', 3),
(2, 'update', 'job_summary', 'Basic radiology tech role', 'Performs diagnostic imaging procedures using specialized equipment to assist in patient diagnosis and treatment.', 2),
(4, 'insert', 'essential_function', NULL, 'Conduct financial modeling and scenario analysis', 5);

-- Insert audit log entries
INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES
(1, 'CREATE', 'job', 1, '{"job_code":"10001","job_title":"Patient Care Technician"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(3, 'UPDATE', 'job_description', 1, '{"version":1}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'STATUS_CHANGE', 'job', 1, '{"old_status":"In Progress","new_status":"Submitted to HR"}', '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(5, 'CREATE', 'essential_function', 13, '{"job_description_id":4,"function_text":"Conduct financial modeling and scenario analysis"}', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(7, 'UPDATE', 'job', 6, '{"status":"Not Started"}', '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- Update sequences to ensure proper next values
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('job_families_id_seq', (SELECT MAX(id) FROM job_families));
SELECT setval('jobs_id_seq', (SELECT MAX(id) FROM jobs));
SELECT setval('job_descriptions_id_seq', (SELECT MAX(id) FROM job_descriptions));
SELECT setval('essential_functions_id_seq', (SELECT MAX(id) FROM essential_functions));
SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));
SELECT setval('dashboard_summary_id_seq', (SELECT MAX(id) FROM dashboard_summary));
SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));
SELECT setval('reviewers_id_seq', (SELECT MAX(id) FROM reviewers));
SELECT setval('job_description_changes_id_seq', (SELECT MAX(id) FROM job_description_changes));
SELECT setval('audit_log_id_seq', (SELECT MAX(id) FROM audit_log));

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