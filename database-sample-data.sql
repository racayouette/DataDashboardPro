-- Job Management Dashboard - Sample Data for Microsoft SQL Server
-- Insert sample data into all tables

-- Insert Users
INSERT INTO users (email, full_name, role, department) VALUES
('sarah.mitchell@company.com', 'Sarah Mitchell', 'admin', 'Human Resources'),
('john.doe@company.com', 'John Doe', 'reviewer', 'Clinical Operations'),
('jane.smith@company.com', 'Jane Smith', 'user', 'Quality Assurance'),
('mike.johnson@company.com', 'Mike Johnson', 'reviewer', 'Nursing Administration'),
('lisa.brown@company.com', 'Lisa Brown', 'user', 'Patient Care'),
('david.wilson@company.com', 'David Wilson', 'reviewer', 'Medical Staff'),
('emily.davis@company.com', 'Emily Davis', 'user', 'Support Services'),
('robert.garcia@company.com', 'Robert Garcia', 'admin', 'Information Technology'),
('maria.rodriguez@company.com', 'Maria Rodriguez', 'user', 'Finance'),
('james.martinez@company.com', 'James Martinez', 'reviewer', 'Operations');

-- Insert Job Families
INSERT INTO job_families (job_family, total_jobs, jobs_reviewed, description) VALUES
('Clinical Support', 45, 32, 'Healthcare support roles including patient care technicians and clinical assistants'),
('Nursing', 38, 28, 'Registered nurses, nurse practitioners, and nursing support staff'),
('Administrative', 52, 40, 'Administrative and clerical positions across all departments'),
('Technical Services', 29, 18, 'IT support, biomedical technicians, and technical specialists'),
('Food Services', 23, 20, 'Dietary staff, food service workers, and nutrition specialists'),
('Environmental Services', 31, 25, 'Housekeeping, maintenance, and facility support staff'),
('Laboratory', 19, 15, 'Lab technicians, phlebotomists, and laboratory support'),
('Pharmacy', 16, 12, 'Pharmacy technicians and pharmaceutical support staff'),
('Radiology', 22, 18, 'Imaging technicians and radiology support personnel'),
('Emergency Services', 27, 21, 'Emergency department staff and first responders');

-- Insert Jobs
INSERT INTO jobs (job_code, job_title, job_family_id, status, reviewer_id) VALUES
('PCT-001', 'Patient Care Technician', 1, 'in_progress', 2),
('RN-001', 'Registered Nurse - ICU', 2, 'completed', 4),
('ADM-001', 'Administrative Assistant', 3, 'draft', 2),
('IT-001', 'IT Support Specialist', 4, 'in_review', 8),
('FS-001', 'Dietary Aide', 5, 'completed', 6),
('EVS-001', 'Environmental Services Technician', 6, 'in_progress', 10),
('LAB-001', 'Laboratory Technician', 7, 'completed', 6),
('PHARM-001', 'Pharmacy Technician', 8, 'draft', 4),
('RAD-001', 'Radiology Technician', 9, 'in_review', 2),
('ER-001', 'Emergency Room Technician', 10, 'in_progress', 10);

-- Insert Dashboard Summary
INSERT INTO dashboard_summary (total_users, revenue, orders, growth_rate, jobs_reviewed, in_progress, not_started) VALUES
(9000, '7.2M', 1247, '12.5%', 229, 18, 55);

-- Insert Transactions
INSERT INTO transactions (customer_name, customer_email, amount, status, description) VALUES
('Sarah Mitchell', 'sarah.mitchell@company.com', '$2,847', 'Completed', 'Job description review services'),
('John Doe', 'john.doe@company.com', '$1,523', 'Pending', 'Training materials development'),
('Jane Smith', 'jane.smith@company.com', '$3,291', 'Completed', 'Quality assurance consultation'),
('Mike Johnson', 'mike.johnson@company.com', '$897', 'Failed', 'System integration services'),
('Lisa Brown', 'lisa.brown@company.com', '$4,156', 'Completed', 'Process improvement analysis'),
('David Wilson', 'david.wilson@company.com', '$2,734', 'Pending', 'Compliance review services'),
('Emily Davis', 'emily.davis@company.com', '$1,845', 'Completed', 'Documentation services'),
('Robert Garcia', 'robert.garcia@company.com', '$3,678', 'Completed', 'Technology implementation'),
('Maria Rodriguez', 'maria.rodriguez@company.com', '$2,156', 'Pending', 'Financial analysis services'),
('James Martinez', 'james.martinez@company.com', '$1,967', 'Completed', 'Operations consulting'),
('Alice Cooper', 'alice.cooper@external.com', '$2,543', 'Completed', 'External training services'),
('Bob Taylor', 'bob.taylor@partner.com', '$1,789', 'Failed', 'Partnership development');

-- Insert Reviewers
INSERT INTO reviewers (job_family, completed, in_progress, responsible) VALUES
('Clinical Support', 32, 8, 'Sarah Mitchell'),
('Nursing', 28, 6, 'John Doe'),
('Administrative', 40, 9, 'Jane Smith'),
('Technical Services', 18, 7, 'Mike Johnson'),
('Food Services', 20, 2, 'Lisa Brown'),
('Environmental Services', 25, 4, 'David Wilson'),
('Laboratory', 15, 3, 'Emily Davis'),
('Pharmacy', 12, 2, 'Robert Garcia'),
('Radiology', 18, 3, 'Maria Rodriguez'),
('Emergency Services', 21, 4, 'James Martinez');

-- Insert Notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'Review Deadline Approaching', 'Job description for PCT-001 review due in 2 days', 'warning', 0),
(2, 'New Job Submitted', 'New job description submitted for RN-002 position', 'info', 0),
(3, 'Status Update Required', 'Please update status for ADM-001 job review', 'info', 0),
(4, 'Feedback Pending Approval', 'Your feedback on IT-001 position requires approval', 'warning', 0),
(1, 'System Maintenance', 'Scheduled maintenance window this weekend', 'info', 1),
(2, 'Training Available', 'New reviewer training sessions available', 'info', 0),
(5, 'Document Updated', 'Job description template has been updated', 'info', 1),
(6, 'Compliance Reminder', 'Monthly compliance review due next week', 'warning', 0);

-- Insert Job Descriptions (sample)
INSERT INTO job_descriptions (job_id, version, job_summary, is_active, created_by) VALUES
(1, 3, 'Provides Patient Care Under Supervision. Assists Patients With Hygiene, Monitoring, And Treatment Goals.', 1, 1),
(2, 2, 'Provides comprehensive nursing care in intensive care unit setting with advanced monitoring capabilities.', 1, 2),
(3, 1, 'Provides administrative support including scheduling, filing, and correspondence management.', 0, 3);

-- Insert Essential Functions (sample for PCT job)
INSERT INTO essential_functions (job_description_id, function_text, sort_order) VALUES
(1, 'Record Vital Signs And Immediately Escalate Critical Values', 1),
(1, 'Aid With Patient Hygiene And Nutritional Needs', 2),
(1, 'Maintain Patient Care Logs And Coordinate With Nursing Staff', 3),
(1, 'Support Safe Patient Transport Within The Facility', 4);

-- Insert Audit Log (sample entries)
INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values) VALUES
(1, 'CREATE', 'jobs', 1, NULL, '{"job_code":"PCT-001","job_title":"Patient Care Technician","status":"draft"}'),
(2, 'UPDATE', 'jobs', 1, '{"status":"draft"}', '{"status":"in_progress"}'),
(1, 'CREATE', 'job_descriptions', 1, NULL, '{"job_id":1,"version":1,"is_active":1}'),
(2, 'UPDATE', 'job_descriptions', 1, '{"version":1}', '{"version":2}'),
(1, 'UPDATE', 'job_descriptions', 1, '{"version":2}', '{"version":3}');