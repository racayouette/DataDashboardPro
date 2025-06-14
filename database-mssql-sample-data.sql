-- Sample Data for Job Description Manager - MS SQL Server
-- Run this after creating the database schema

USE JobDescriptionDB;
GO

-- Insert sample job families
INSERT INTO jobFamilies (name, description) VALUES
('Information Technology', 'Roles related to software development, system administration, and IT support'),
('Human Resources', 'Positions focused on talent management, recruitment, and employee relations'),
('Finance & Accounting', 'Financial planning, accounting, and budgeting roles'),
('Marketing & Communications', 'Brand management, digital marketing, and corporate communications'),
('Operations & Management', 'Operational oversight, project management, and leadership positions'),
('Customer Service', 'Customer support, account management, and client relations'),
('Sales', 'Business development, account management, and revenue generation'),
('Engineering', 'Technical design, development, and engineering roles'),
('Healthcare', 'Medical, nursing, and healthcare administration positions'),
('Education & Training', 'Teaching, curriculum development, and educational administration');
GO

-- Insert sample users (for testing purposes)
INSERT INTO users (id, email, firstName, lastName) VALUES
('admin001', 'admin@company.com', 'System', 'Administrator'),
('hr001', 'hr.manager@company.com', 'Sarah', 'Johnson'),
('it001', 'it.director@company.com', 'Michael', 'Chen'),
('mgr001', 'operations.mgr@company.com', 'Jennifer', 'Davis'),
('rec001', 'recruiter@company.com', 'David', 'Wilson');
GO

-- Insert user roles
INSERT INTO userRoles (userId, role) VALUES
('admin001', 'Admin'),
('hr001', 'HR Manager'),
('it001', 'Reviewer'),
('mgr001', 'Reviewer'),
('rec001', 'Employee');
GO

-- Insert sample job descriptions
INSERT INTO jobDescriptions (title, jobFamilyId, department, location, employmentType, salaryRange, description, requirements, benefits, status, createdBy) VALUES
('Senior Software Developer', 1, 'Information Technology', 'New York, NY', 'Full-time', '$90,000 - $120,000', 
'We are seeking an experienced Senior Software Developer to join our dynamic development team. The ideal candidate will be responsible for designing, developing, and maintaining high-quality software applications that meet business requirements.', 
'• Bachelor''s degree in Computer Science or related field
• 5+ years of experience in software development
• Proficiency in JavaScript, Python, or Java
• Experience with modern frameworks (React, Angular, or Vue.js)
• Strong knowledge of database systems (SQL Server, PostgreSQL)
• Excellent problem-solving and communication skills', 
'• Competitive salary and performance bonuses
• Comprehensive health insurance
• 401(k) with company matching
• Flexible work arrangements
• Professional development opportunities', 'Published', 'hr001'),

('HR Business Partner', 2, 'Human Resources', 'Chicago, IL', 'Full-time', '$75,000 - $95,000',
'Join our HR team as an HR Business Partner, where you will serve as a strategic partner to business leaders, providing guidance on organizational development, talent management, and employee relations.',
'• Bachelor''s degree in Human Resources, Business, or related field
• 3-5 years of HR generalist experience
• Strong knowledge of employment law and HR best practices
• Experience with HRIS systems
• Excellent interpersonal and communication skills
• PHR or SHRM certification preferred',
'• Health, dental, and vision insurance
• Paid time off and holidays
• Professional development budget
• Tuition reimbursement
• Employee assistance program', 'Published', 'hr001'),

('Financial Analyst', 3, 'Finance', 'Remote', 'Full-time', '$60,000 - $80,000',
'We are looking for a detail-oriented Financial Analyst to support financial planning, budgeting, and analysis activities. This role offers the opportunity to work with cross-functional teams and contribute to strategic decision-making.',
'• Bachelor''s degree in Finance, Accounting, or Economics
• 2-4 years of financial analysis experience
• Advanced Excel skills and financial modeling experience
• Knowledge of financial software (SAP, Oracle, or similar)
• Strong analytical and quantitative skills
• CFA or CPA certification a plus',
'• Competitive salary
• Remote work flexibility
• Health and wellness benefits
• Stock option plan
• Annual performance bonus', 'Draft', 'hr001'),

('Marketing Manager', 4, 'Marketing', 'Los Angeles, CA', 'Full-time', '$70,000 - $90,000',
'Lead our marketing initiatives as a Marketing Manager, developing and executing comprehensive marketing strategies to drive brand awareness and customer acquisition.',
'• Bachelor''s degree in Marketing, Communications, or related field
• 4-6 years of marketing experience
• Experience with digital marketing platforms (Google Ads, Facebook, LinkedIn)
• Strong project management skills
• Data-driven mindset with analytics experience
• Creative thinking and problem-solving abilities',
'• Competitive salary and bonus structure
• Health insurance package
• Creative work environment
• Professional conference attendance
• Marketing tool stipend', 'Review', 'hr001'),

('Customer Service Representative', 6, 'Customer Service', 'Dallas, TX', 'Full-time', '$35,000 - $45,000',
'Provide exceptional customer service as a Customer Service Representative, handling inquiries, resolving issues, and ensuring customer satisfaction across multiple communication channels.',
'• High school diploma or equivalent
• 1-2 years of customer service experience
• Excellent verbal and written communication skills
• Proficiency with CRM systems
• Patience and empathy when dealing with customers
• Bilingual (English/Spanish) preferred',
'• Health and dental insurance
• Paid training program
• Career advancement opportunities
• Employee discounts
• Flexible scheduling options', 'Published', 'hr001');
GO

-- Insert job description history for version tracking
INSERT INTO jobDescriptionHistory (jobDescriptionId, version, title, description, requirements, benefits, changes, modifiedBy) VALUES
(1, 1, 'Senior Software Developer', 'Initial job description created', 'Initial requirements', 'Initial benefits package', 'Job description created', 'hr001'),
(2, 1, 'HR Business Partner', 'Initial job description created', 'Initial requirements', 'Initial benefits package', 'Job description created', 'hr001'),
(3, 1, 'Financial Analyst', 'Initial job description created', 'Initial requirements', 'Initial benefits package', 'Job description created', 'hr001');
GO

-- Insert sample notifications
INSERT INTO notifications (userId, title, message, type) VALUES
('hr001', 'New Job Description Submitted', 'Marketing Manager position has been submitted for review', 'info'),
('it001', 'Review Required', 'Senior Software Developer job description needs your review', 'warning'),
('mgr001', 'Approval Pending', 'Financial Analyst position is pending approval', 'info'),
('admin001', 'System Update', 'Active Directory configuration has been updated', 'success');
GO

-- Insert sample Active Directory configurations (placeholder - will be configured by admin)
INSERT INTO activeDirectoryConfigs (environment, serverUrl, baseDN, username, password, domain, port, useSSL, isActive) VALUES
('test', 'ldap://test-ad.company.local', 'DC=test,DC=company,DC=local', 'service-account', 'encrypted-password', 'TEST', 389, 0, 1),
('live', 'ldap://ad.company.com', 'DC=company,DC=com', 'service-account', 'encrypted-password', 'COMPANY', 636, 1, 0);
GO

PRINT 'Sample data inserted successfully!';
PRINT 'Default login credentials:';
PRINT 'Admin: admin@company.com';
PRINT 'HR Manager: hr.manager@company.com';
PRINT 'IT Director: it.director@company.com';
GO