-- =============================================
-- Sample Data for Job Management System
-- Microsoft SQL Server Implementation
-- =============================================

-- Clear existing data (uncomment if needed)
-- DELETE FROM audit_log;
-- DELETE FROM job_description_changes;
-- DELETE FROM essential_functions;
-- DELETE FROM job_descriptions;
-- DELETE FROM jobs;
-- DELETE FROM notifications;
-- DELETE FROM reviewers;
-- DELETE FROM transactions;
-- DELETE FROM dashboard_summary;
-- DELETE FROM job_families;
-- DELETE FROM users;
-- GO

-- =============================================
-- INSERT USERS
-- =============================================
INSERT INTO users (name, email, role, department, status, last_login) VALUES
('John Smith', 'john.smith@company.com', 'Admin', 'IT', 'Active', '2025-06-04 10:30:00'),
('Sarah Johnson', 'sarah.johnson@company.com', 'HR Manager', 'Human Resources', 'Active', '2025-06-03 14:15:00'),
('Michael Brown', 'michael.brown@company.com', 'Reviewer', 'Operations', 'Active', '2025-06-02 09:45:00'),
('Emily Davis', 'emily.davis@company.com', 'Employee', 'Marketing', 'Inactive', '2025-05-30 16:20:00'),
('David Wilson', 'david.wilson@company.com', 'Reviewer', 'Quality Assurance', 'Active', '2025-06-01 11:10:00'),
('John Mark', 'john.mark@company.com', 'Admin', 'Executive', 'Active', '2025-06-05 08:00:00'),
('Sarah Mitchell', 'sarah.mitchell@company.com', 'Reviewer', 'Clinical Support', 'Active', '2025-06-04 13:30:00'),
('Kelly Johnson', 'kelly.johnson@company.com', 'Reviewer', 'Revenue Cycle', 'Active', '2025-06-03 15:45:00'),
('Robert Kennedy', 'robert.kennedy@company.com', 'Reviewer', 'Finance', 'Active', '2025-06-02 12:20:00'),
('Adam Lambert', 'adam.lambert@company.com', 'Reviewer', 'HR', 'Active', '2025-06-01 17:30:00'),
('Jennifer Williams', 'jennifer.williams@company.com', 'Reviewer', 'IT Services', 'Active', '2025-05-31 10:15:00'),
('Michael Roberts', 'michael.roberts@company.com', 'Reviewer', 'Pharmacy', 'Active', '2025-05-30 14:45:00'),
('Linda Taylor', 'linda.taylor@company.com', 'Reviewer', 'Lab Services', 'Active', '2025-05-29 16:00:00'),
('David Phillips', 'david.phillips@company.com', 'Reviewer', 'Behavioral Health', 'Active', '2025-05-28 11:30:00'),
('Emma Sullivan', 'emma.sullivan@company.com', 'Reviewer', 'Security', 'Active', '2025-05-27 09:20:00'),
('Chris Harrison', 'chris.harrison@company.com', 'Reviewer', 'Quality', 'Active', '2025-05-26 13:10:00');

-- =============================================
-- INSERT JOB FAMILIES
-- =============================================
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
('Legal', 12, 10, 'Legal and compliance roles');

-- =============================================
-- INSERT JOBS
-- =============================================
INSERT INTO jobs (job_code, job_title, job_family_id, reviewer_id, responsible_id, status, last_updated) VALUES
('10001', 'Patient Care Technician', 1, 7, 3, 'In Progress', '2025-06-15 14:30:00'),
('10002', 'Radiology Tech', 1, 8, 5, 'Not Started', '2025-01-08 10:15:00'),
('10003', 'Billing Specialist', 2, 9, 2, 'Reviewed', '2025-03-22 16:45:00'),
('10004', 'Financial Analyst', 3, 10, 4, 'In Progress', '2025-05-10 11:20:00'),
('10005', 'Nurse Practitioner', 1, 11, 3, 'In Progress', '2025-04-18 13:30:00'),
('10006', 'HR Generalist', 4, 12, 2, 'Not Started', '2025-02-14 09:45:00'),
('10007', 'IT Support Technician', 5, 13, 1, 'Completed', '2025-06-03 15:20:00'),
('10008', 'Pharmacy Tech', 6, 14, 5, 'In Progress', '2025-03-05 12:10:00'),
('10009', 'Lab Assistant', 7, 15, 4, 'In Progress', '2025-01-30 17:25:00'),
('10010', 'Social Worker', 8, 16, 3, 'Not Started', '2025-06-28 08:40:00'),
('10011', 'Medical Assistant', 1, 7, 2, 'In Progress', '2025-05-22 14:15:00'),
('10012', 'Revenue Cycle Analyst', 2, 8, 1, 'Completed', '2025-04-12 10:30:00'),
('10013', 'Physical Therapist', 1, 9, 5, 'Not Started', '2025-03-08 16:00:00'),
('10014', 'Clinical Coordinator', 1, 10, 4, 'In Progress', '2025-06-05 11:45:00'),
('10015', 'Security Officer', 9, 11, 3, 'Completed', '2025-02-28 13:20:00'),
('10016', 'Quality Assurance Specialist', 10, 12, 2, 'In Progress', '2025-05-15 09:30:00'),
('10017', 'Respiratory Therapist', 1, 13, 1, 'Not Started', '2025-01-20 15:45:00'),
('10018', 'Dietician', 11, 14, 5, 'In Progress', '2025-04-25 12:50:00'),
('10019', 'Case Manager', 8, 15, 4, 'Completed', '2025-03-18 14:35:00'),
('10020', 'Maintenance Technician', 12, 16, 3, 'In Progress', '2025-06-10 10:20:00');

-- =============================================
-- INSERT JOB DESCRIPTIONS
-- =============================================
INSERT INTO job_descriptions (job_id, version, job_summary, original_job_summary, last_edited_by_id, is_active) VALUES
(1, 1, 'The Patient Care Technician provides direct patient care under the supervision of registered nurses. Responsibilities include vital sign monitoring, patient mobility assistance, and maintaining a safe patient environment.', 
'The Patient Care Technician provides direct patient care under the supervision of registered nurses. Responsibilities include vital sign monitoring, patient mobility assistance, and maintaining a safe patient environment.', 7, 1),
(2, 1, 'Radiology Technician operates imaging equipment to produce diagnostic images. Must maintain equipment, ensure patient safety, and follow radiation safety protocols.', 
'Radiology Technician operates imaging equipment to produce diagnostic images. Must maintain equipment, ensure patient safety, and follow radiation safety protocols.', 8, 1),
(3, 1, 'Billing Specialist processes medical claims, verifies insurance coverage, and manages patient billing inquiries. Ensures accurate coding and timely claim submission.', 
'Billing Specialist processes medical claims, verifies insurance coverage, and manages patient billing inquiries. Ensures accurate coding and timely claim submission.', 9, 1),
(4, 1, 'Financial Analyst analyzes financial data, prepares reports, and supports budgeting processes. Provides insights for strategic financial decision-making.', 
'Financial Analyst analyzes financial data, prepares reports, and supports budgeting processes. Provides insights for strategic financial decision-making.', 10, 1),
(5, 1, 'Nurse Practitioner provides advanced nursing care, diagnoses conditions, and prescribes treatments. Works collaboratively with physicians to deliver comprehensive patient care.', 
'Nurse Practitioner provides advanced nursing care, diagnoses conditions, and prescribes treatments. Works collaboratively with physicians to deliver comprehensive patient care.', 11, 1);

-- =============================================
-- INSERT ESSENTIAL FUNCTIONS
-- =============================================
INSERT INTO essential_functions (job_description_id, function_text, sort_order, has_edit) VALUES
(1, 'Monitor and record patient vital signs including blood pressure, temperature, pulse, and respirations', 1, 1),
(1, 'Assist patients with activities of daily living including bathing, feeding, and mobility', 2, 1),
(1, 'Maintain accurate documentation of patient care activities and observations', 3, 1),
(1, 'Ensure patient safety and comfort at all times', 4, 1),
(1, 'Communicate effectively with nursing staff and other healthcare team members', 5, 1),
(2, 'Operate radiographic equipment to produce high-quality diagnostic images', 1, 1),
(2, 'Position patients correctly for various imaging procedures', 2, 1),
(2, 'Follow radiation safety protocols and maintain ALARA principles', 3, 1),
(2, 'Maintain and perform quality control on imaging equipment', 4, 1),
(2, 'Provide patient education and comfort during procedures', 5, 1),
(3, 'Process and submit medical insurance claims accurately and timely', 1, 1),
(3, 'Verify patient insurance coverage and benefits', 2, 1),
(3, 'Resolve billing discrepancies and answer patient billing inquiries', 3, 1),
(3, 'Maintain knowledge of current CPT and ICD-10 coding standards', 4, 1),
(3, 'Generate reports on billing metrics and collection activities', 5, 1);

-- =============================================
-- INSERT NOTIFICATIONS
-- =============================================
INSERT INTO notifications (user_id, title, message, type, category, priority, is_read) VALUES
(7, 'Job Review Deadline', 'Patient Care Technician job description review is due in 2 days', 'warning', 'deadline', 'high', 0),
(8, 'New Job Assignment', 'You have been assigned to review Radiology Tech position', 'info', 'assignment', 'medium', 0),
(9, 'Review Completed', 'Billing Specialist job description has been approved', 'success', 'completion', 'low', 1),
(10, 'System Update', 'Job management system will undergo maintenance this weekend', 'info', 'system', 'medium', 0),
(11, 'Feedback Required', 'Please provide feedback on Nurse Practitioner job requirements', 'warning', 'feedback', 'high', 0),
(12, 'Status Update', 'HR Generalist position status has been changed to Not Started', 'info', 'status', 'low', 1);

-- =============================================
-- INSERT DASHBOARD SUMMARY
-- =============================================
INSERT INTO dashboard_summary (total_users, revenue, orders, growth_rate, jobs_reviewed, in_progress, not_started) VALUES
(9000, 712.00, 132, 56.00, 145, 85, 40);

-- =============================================
-- INSERT TRANSACTIONS
-- =============================================
INSERT INTO transactions (customer_name, customer_email, amount, status, description, date) VALUES
('Sarah Miller', 'sarah.miller@example.com', 2450.00, 'Completed', 'Clinical support job family review', '2025-03-15 14:30:00'),
('John Davis', 'john@example.com', 1250.00, 'Pending', 'IT Services job family assessment', '2025-03-14 10:15:00'),
('Maria Rodriguez', 'maria.rodriguez@example.com', 3200.00, 'Completed', 'Revenue cycle optimization project', '2025-03-13 16:45:00'),
('David Thompson', 'david.t@example.com', 1800.00, 'Failed', 'Quality assurance consulting', '2025-03-12 11:20:00');

-- =============================================
-- INSERT REVIEWERS
-- =============================================
INSERT INTO reviewers (job_family, completed, in_progress, responsible) VALUES
('Sarah Mitchell', 82, 5, 'James Patterson'),
('Kelly Johnson', 67, 12, 'Maria Rodriguez'),
('Robert Kennedy', 45, 8, 'Jennifer Smith'),
('Adam Lambert', 73, 6, 'Michael Brown'),
('Jennifer Williams', 91, 3, 'Lisa Anderson'),
('Michael Roberts', 38, 15, 'Thomas Garcia'),
('Linda Taylor', 56, 9, 'David Thompson'),
('David Phillips', 42, 7, 'Susan Davis'),
('Emma Sullivan', 59, 11, 'Patricia Miller'),
('Chris Harrison', 74, 4, 'Kevin Garcia'),
('Robert Taylor', 63, 8, 'Carlos Martinez'),
('Amanda Wilson', 48, 13, 'Amanda Wilson'),
('Nicole Taylor', 35, 6, 'Nicole Taylor'),
('Thomas Anderson', 52, 10, 'Linda Johnson'),
('Brian Wilson', 67, 5, 'Brian Wilson'),
('Angela Martinez', 41, 14, 'Angela Martinez'),
('Christine Lee', 58, 7, 'Christine Lee'),
('Daniel Garcia', 46, 9, 'Daniel Garcia');

-- =============================================
-- INSERT SAMPLE AUDIT LOGS
-- =============================================
INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES
(7, 'CREATE', 'JobDescription', 1, '{"action":"created_job_description","job_id":1}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(8, 'UPDATE', 'Job', 2, '{"field":"status","old_value":"Not Started","new_value":"In Progress"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(9, 'APPROVE', 'JobDescription', 3, '{"action":"approved_job_description","job_id":3}', '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(10, 'LOGIN', 'User', 10, '{"login_time":"2025-05-10T11:20:00Z"}', '192.168.1.103', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
(11, 'CREATE', 'EssentialFunction', 1, '{"job_description_id":1,"function_text":"Monitor vital signs"}', '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- =============================================
-- INSERT SAMPLE JOB DESCRIPTION CHANGES
-- =============================================
INSERT INTO job_description_changes (job_description_id, change_type, field_name, old_value, new_value, user_id) VALUES
(1, 'update', 'job_summary', 'Original summary text...', 'Updated summary with additional requirements...', 7),
(2, 'insert', 'essential_function', NULL, 'New essential function added', 8),
(3, 'update', 'job_summary', 'Previous billing specialist description', 'Updated billing specialist with new responsibilities', 9);

PRINT 'Sample data inserted successfully!';
PRINT 'Database is now ready for use with the Job Management System.';

-- =============================================
-- VERIFY DATA INSERTION
-- =============================================
SELECT 'Users' AS TableName, COUNT(*) AS RecordCount FROM users
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
SELECT 'Audit Logs', COUNT(*) FROM audit_log
UNION ALL
SELECT 'Job Description Changes', COUNT(*) FROM job_description_changes;