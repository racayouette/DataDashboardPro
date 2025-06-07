-- Job Management System - Microsoft SQL Server Stored Procedures
-- Created: 2025-06-07
-- Description: Stored procedures for the job description management platform

-- Drop existing procedures if they exist
IF OBJECT_ID('sp_GetDashboardSummary', 'P') IS NOT NULL DROP PROCEDURE sp_GetDashboardSummary;
IF OBJECT_ID('sp_CreateJobWithDescription', 'P') IS NOT NULL DROP PROCEDURE sp_CreateJobWithDescription;
IF OBJECT_ID('sp_UpdateJobDescription', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateJobDescription;
IF OBJECT_ID('sp_ReorderEssentialFunctions', 'P') IS NOT NULL DROP PROCEDURE sp_ReorderEssentialFunctions;
IF OBJECT_ID('sp_GetJobDetails', 'P') IS NOT NULL DROP PROCEDURE sp_GetJobDetails;
IF OBJECT_ID('sp_GetEssentialFunctions', 'P') IS NOT NULL DROP PROCEDURE sp_GetEssentialFunctions;
IF OBJECT_ID('sp_UpdateJobStatus', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateJobStatus;
IF OBJECT_ID('sp_GetUserNotifications', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserNotifications;
IF OBJECT_ID('sp_MarkNotificationRead', 'P') IS NOT NULL DROP PROCEDURE sp_MarkNotificationRead;
IF OBJECT_ID('sp_GetJobFamiliesWithStats', 'P') IS NOT NULL DROP PROCEDURE sp_GetJobFamiliesWithStats;
IF OBJECT_ID('sp_GetAuditTrail', 'P') IS NOT NULL DROP PROCEDURE sp_GetAuditTrail;
IF OBJECT_ID('sp_CleanupOldData', 'P') IS NOT NULL DROP PROCEDURE sp_CleanupOldData;
GO

-- Procedure: Get dashboard summary with calculated metrics
CREATE PROCEDURE sp_GetDashboardSummary
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @total_users INT;
    DECLARE @revenue DECIMAL(12, 2);
    DECLARE @orders INT;
    DECLARE @growth_rate DECIMAL(5, 2);
    DECLARE @jobs_reviewed INT;
    DECLARE @in_progress INT;
    DECLARE @not_started INT;
    DECLARE @completed INT;
    DECLARE @submitted_to_hr INT;
    
    SELECT @total_users = COUNT(*) FROM users WHERE status = 'Active';
    SELECT @revenue = ISNULL(SUM(amount), 0) FROM transactions WHERE status = 'Completed';
    SELECT @orders = COUNT(*) FROM transactions;
    
    DECLARE @total_jobs INT;
    SELECT @total_jobs = COUNT(*) FROM jobs;
    
    IF @total_jobs > 0
        SELECT @growth_rate = (CAST(COUNT(*) AS DECIMAL(5,2)) * 100.0 / @total_jobs) 
        FROM jobs WHERE status IN ('Completed', 'Reviewed');
    ELSE
        SET @growth_rate = 0.00;
    
    SELECT @jobs_reviewed = COUNT(*) FROM jobs WHERE status IN ('Completed', 'Reviewed');
    SELECT @in_progress = COUNT(*) FROM jobs WHERE status = 'In Progress';
    SELECT @not_started = COUNT(*) FROM jobs WHERE status = 'Not Started';
    SELECT @completed = COUNT(*) FROM jobs WHERE status = 'Completed';
    SELECT @submitted_to_hr = COUNT(*) FROM jobs WHERE status = 'Submitted to HR';
    
    SELECT 
        @total_users AS total_users,
        @revenue AS revenue,
        @orders AS orders,
        @growth_rate AS growth_rate,
        @jobs_reviewed AS jobs_reviewed,
        @in_progress AS in_progress,
        @not_started AS not_started,
        @completed AS completed,
        @submitted_to_hr AS submitted_to_hr;
END;
GO

-- Procedure: Create new job with initial job description
CREATE PROCEDURE sp_CreateJobWithDescription
    @job_code NVARCHAR(50),
    @job_title NVARCHAR(255),
    @job_family_id INT,
    @reviewer_id INT,
    @responsible_id INT,
    @job_summary NVARCHAR(MAX),
    @created_by_id INT,
    @job_id INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @job_description_id INT;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Insert job
        INSERT INTO jobs (job_code, job_title, job_family_id, reviewer_id, responsible_id, status)
        VALUES (@job_code, @job_title, @job_family_id, @reviewer_id, @responsible_id, 'Not Started');
        
        SET @job_id = SCOPE_IDENTITY();
        
        -- Insert initial job description
        INSERT INTO job_descriptions (job_id, job_summary, original_job_summary, last_edited_by_id, version)
        VALUES (@job_id, @job_summary, @job_summary, @created_by_id, 1);
        
        SET @job_description_id = SCOPE_IDENTITY();
        
        -- Log audit entry
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
        VALUES (@created_by_id, 'CREATE', 'job', @job_id, 
                '{"job_code":"' + @job_code + '","job_title":"' + @job_title + '"}');
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- Procedure: Update job description and create version history
CREATE PROCEDURE sp_UpdateJobDescription
    @job_description_id INT,
    @job_summary NVARCHAR(MAX),
    @user_id INT,
    @new_job_description_id INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @current_version INT;
    DECLARE @new_version INT;
    DECLARE @job_id INT;
    DECLARE @old_summary NVARCHAR(MAX);
    DECLARE @original_summary NVARCHAR(MAX);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Get current version and job info
        SELECT @current_version = version, @job_id = job_id, @old_summary = job_summary, @original_summary = original_job_summary
        FROM job_descriptions 
        WHERE id = @job_description_id;
        
        -- Calculate new version
        SET @new_version = @current_version + 1;
        
        -- Mark current version as inactive
        UPDATE job_descriptions 
        SET is_active = 0 
        WHERE id = @job_description_id;
        
        -- Create new version
        INSERT INTO job_descriptions (job_id, job_summary, original_job_summary, last_edited_by_id, version)
        VALUES (@job_id, @job_summary, @original_summary, @user_id, @new_version);
        
        SET @new_job_description_id = SCOPE_IDENTITY();
        
        -- Log the change
        INSERT INTO job_description_changes (job_description_id, change_type, field_name, old_value, new_value, user_id)
        VALUES (@new_job_description_id, 'update', 'job_summary', @old_summary, @job_summary, @user_id);
        
        -- Update job last_updated
        UPDATE jobs SET last_updated = GETDATE() WHERE id = @job_id;
        
        -- Log audit entry
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
        VALUES (@user_id, 'UPDATE', 'job_description', @new_job_description_id, 
                '{"version":' + CAST(@new_version AS NVARCHAR(10)) + '}');
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- Procedure: Reorder essential functions
CREATE PROCEDURE sp_ReorderEssentialFunctions
    @job_description_id INT,
    @function_ids NVARCHAR(MAX), -- Comma-separated list of function IDs
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @function_id INT;
    DECLARE @new_order INT = 1;
    DECLARE @pos INT;
    DECLARE @remaining NVARCHAR(MAX) = @function_ids;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Parse comma-separated function IDs and update sort orders
        WHILE LEN(@remaining) > 0
        BEGIN
            SET @pos = CHARINDEX(',', @remaining);
            IF @pos = 0
            BEGIN
                SET @function_id = CAST(@remaining AS INT);
                SET @remaining = '';
            END
            ELSE
            BEGIN
                SET @function_id = CAST(LEFT(@remaining, @pos - 1) AS INT);
                SET @remaining = SUBSTRING(@remaining, @pos + 1, LEN(@remaining));
            END
            
            UPDATE essential_functions 
            SET sort_order = @new_order, updated_at = GETDATE()
            WHERE id = @function_id AND job_description_id = @job_description_id;
            
            SET @new_order = @new_order + 1;
        END;
        
        -- Log audit entry
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
        VALUES (@user_id, 'REORDER', 'essential_functions', @job_description_id, 
                '{"function_ids":"' + @function_ids + '"}');
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- Procedure: Get job with full details including descriptions and functions
CREATE PROCEDURE sp_GetJobDetails
    @job_code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        j.id AS job_id,
        j.job_code,
        j.job_title,
        jf.job_family,
        u1.name AS reviewer_name,
        u2.name AS responsible_name,
        j.status,
        j.last_updated,
        jd.id AS job_description_id,
        jd.job_summary,
        jd.version,
        u3.name AS last_edited_by,
        jd.last_updated_date
    FROM jobs j
    LEFT JOIN job_families jf ON j.job_family_id = jf.id
    LEFT JOIN users u1 ON j.reviewer_id = u1.id
    LEFT JOIN users u2 ON j.responsible_id = u2.id
    LEFT JOIN job_descriptions jd ON j.id = jd.job_id AND jd.is_active = 1
    LEFT JOIN users u3 ON jd.last_edited_by_id = u3.id
    WHERE j.job_code = @job_code;
END;
GO

-- Procedure: Get essential functions for a job description
CREATE PROCEDURE sp_GetEssentialFunctions
    @job_description_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        id,
        function_text,
        sort_order,
        has_edit,
        created_at,
        updated_at
    FROM essential_functions
    WHERE job_description_id = @job_description_id
    ORDER BY sort_order;
END;
GO

-- Procedure: Update job status with notification
CREATE PROCEDURE sp_UpdateJobStatus
    @job_id INT,
    @new_status NVARCHAR(50),
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @old_status NVARCHAR(50);
    DECLARE @job_code NVARCHAR(50);
    DECLARE @job_title NVARCHAR(255);
    DECLARE @reviewer_id INT;
    DECLARE @responsible_id INT;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Get current job info
        SELECT @old_status = status, @job_code = job_code, @job_title = job_title, 
               @reviewer_id = reviewer_id, @responsible_id = responsible_id
        FROM jobs WHERE id = @job_id;
        
        -- Update job status
        UPDATE jobs 
        SET status = @new_status, last_updated = GETDATE()
        WHERE id = @job_id;
        
        -- Create notifications based on status change
        IF @new_status = 'Submitted to HR'
        BEGIN
            -- Notify HR team
            INSERT INTO notifications (user_id, title, message, type, category, priority)
            SELECT u.id, 'Job Submitted for HR Review', 
                   'Job ' + @job_code + ' (' + @job_title + ') has been submitted for HR review',
                   'info', 'job_status', 'medium'
            FROM users u 
            WHERE u.role = 'HR Manager' AND u.status = 'Active';
        END;
        
        IF @new_status = 'Completed'
        BEGIN
            -- Notify reviewer and responsible person
            IF @reviewer_id IS NOT NULL
            BEGIN
                INSERT INTO notifications (user_id, title, message, type, category, priority)
                VALUES (@reviewer_id, 'Job Completed', 
                       'Job ' + @job_code + ' (' + @job_title + ') has been completed',
                       'success', 'job_status', 'medium');
            END;
            
            IF @responsible_id IS NOT NULL AND @responsible_id != @reviewer_id
            BEGIN
                INSERT INTO notifications (user_id, title, message, type, category, priority)
                VALUES (@responsible_id, 'Job Completed', 
                       'Job ' + @job_code + ' (' + @job_title + ') has been completed',
                       'success', 'job_status', 'medium');
            END;
        END;
        
        -- Log audit entry
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
        VALUES (@user_id, 'STATUS_CHANGE', 'job', @job_id, 
                '{"old_status":"' + @old_status + '","new_status":"' + @new_status + '"}');
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- Procedure: Get user notifications with pagination
CREATE PROCEDURE sp_GetUserNotifications
    @user_id INT,
    @page INT = 1,
    @limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @offset INT = (@page - 1) * @limit;
    
    SELECT 
        id,
        title,
        message,
        type,
        category,
        priority,
        is_read,
        created_at,
        (SELECT COUNT(*) FROM notifications WHERE user_id = @user_id OR user_id IS NULL) AS total_count
    FROM notifications
    WHERE user_id = @user_id OR user_id IS NULL
    ORDER BY created_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY;
END;
GO

-- Procedure: Mark notification as read
CREATE PROCEDURE sp_MarkNotificationRead
    @notification_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE notifications 
    SET is_read = 1, updated_at = GETDATE()
    WHERE id = @notification_id;
    
    SELECT @@ROWCOUNT AS rows_affected;
END;
GO

-- Procedure: Get job families with statistics
CREATE PROCEDURE sp_GetJobFamiliesWithStats
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        jf.id,
        jf.job_family,
        COUNT(j.id) AS total_jobs,
        SUM(CASE WHEN j.status IN ('Completed', 'Reviewed') THEN 1 ELSE 0 END) AS jobs_reviewed,
        SUM(CASE WHEN j.status = 'In Progress' THEN 1 ELSE 0 END) AS jobs_in_progress,
        SUM(CASE WHEN j.status = 'Not Started' THEN 1 ELSE 0 END) AS jobs_not_started,
        SUM(CASE WHEN j.status = 'Completed' THEN 1 ELSE 0 END) AS jobs_completed,
        SUM(CASE WHEN j.status = 'Submitted to HR' THEN 1 ELSE 0 END) AS jobs_submitted_to_hr,
        jf.description,
        jf.created_at,
        jf.updated_at
    FROM job_families jf
    LEFT JOIN jobs j ON jf.id = j.job_family_id
    GROUP BY jf.id, jf.job_family, jf.description, jf.created_at, jf.updated_at
    ORDER BY jf.job_family;
END;
GO

-- Procedure: Get audit trail for a specific entity
CREATE PROCEDURE sp_GetAuditTrail
    @entity_type NVARCHAR(100),
    @entity_id INT = NULL,
    @limit INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@limit)
        al.id,
        u.name AS user_name,
        al.action,
        al.details,
        al.ip_address,
        al.created_at
    FROM audit_log al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.entity_type = @entity_type 
    AND (@entity_id IS NULL OR al.entity_id = @entity_id)
    ORDER BY al.created_at DESC;
END;
GO

-- Procedure: Clean up old data (maintenance)
CREATE PROCEDURE sp_CleanupOldData
    @days_to_keep INT = 90
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @audit_deleted INT;
    DECLARE @notifications_deleted INT;
    DECLARE @job_descriptions_deleted INT;
    DECLARE @cutoff_date DATETIME2 = DATEADD(DAY, -@days_to_keep, GETDATE());
    DECLARE @notification_cutoff_date DATETIME2 = DATEADD(DAY, -(@days_to_keep / 2), GETDATE());
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Delete old audit logs
        DELETE FROM audit_log 
        WHERE created_at < @cutoff_date;
        SET @audit_deleted = @@ROWCOUNT;
        
        -- Delete old read notifications
        DELETE FROM notifications 
        WHERE is_read = 1 AND created_at < @notification_cutoff_date;
        SET @notifications_deleted = @@ROWCOUNT;
        
        -- Delete old inactive job description versions (keep last 5 versions)
        DELETE jd1
        FROM job_descriptions jd1
        WHERE is_active = 0 
        AND created_at < @cutoff_date
        AND (
            SELECT COUNT(*) 
            FROM job_descriptions jd2 
            WHERE jd2.job_id = jd1.job_id 
            AND jd2.version > jd1.version
        ) > 5;
        SET @job_descriptions_deleted = @@ROWCOUNT;
        
        COMMIT TRANSACTION;
        
        -- Return cleanup results
        SELECT 
            @audit_deleted AS audit_logs_deleted,
            @notifications_deleted AS old_notifications_deleted,
            @job_descriptions_deleted AS inactive_job_descriptions_deleted;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- Additional utility procedures

-- Procedure: Get job statistics by status
CREATE PROCEDURE sp_GetJobStatistics
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        status,
        COUNT(*) AS job_count,
        CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM jobs) AS DECIMAL(5,2)) AS percentage
    FROM jobs
    GROUP BY status
    ORDER BY job_count DESC;
END;
GO

-- Procedure: Get top reviewers by completed jobs
CREATE PROCEDURE sp_GetTopReviewers
    @limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@limit)
        u.id,
        u.name,
        u.email,
        COUNT(j.id) AS completed_jobs,
        AVG(DATEDIFF(DAY, j.created_at, j.last_updated)) AS avg_days_to_complete
    FROM users u
    INNER JOIN jobs j ON u.id = j.reviewer_id
    WHERE j.status IN ('Completed', 'Reviewed')
    AND u.status = 'Active'
    GROUP BY u.id, u.name, u.email
    ORDER BY completed_jobs DESC, avg_days_to_complete ASC;
END;
GO

-- Procedure: Search jobs with filters
CREATE PROCEDURE sp_SearchJobs
    @search_term NVARCHAR(255) = NULL,
    @job_family_id INT = NULL,
    @status NVARCHAR(50) = NULL,
    @reviewer_id INT = NULL,
    @page INT = 1,
    @limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @offset INT = (@page - 1) * @limit;
    
    SELECT 
        j.id,
        j.job_code,
        j.job_title,
        jf.job_family,
        u1.name AS reviewer_name,
        u2.name AS responsible_name,
        j.status,
        j.last_updated,
        j.created_at,
        COUNT(*) OVER() AS total_count
    FROM jobs j
    LEFT JOIN job_families jf ON j.job_family_id = jf.id
    LEFT JOIN users u1 ON j.reviewer_id = u1.id
    LEFT JOIN users u2 ON j.responsible_id = u2.id
    WHERE 
        (@search_term IS NULL OR 
         j.job_code LIKE '%' + @search_term + '%' OR 
         j.job_title LIKE '%' + @search_term + '%' OR
         jf.job_family LIKE '%' + @search_term + '%')
    AND (@job_family_id IS NULL OR j.job_family_id = @job_family_id)
    AND (@status IS NULL OR j.status = @status)
    AND (@reviewer_id IS NULL OR j.reviewer_id = @reviewer_id)
    ORDER BY j.last_updated DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY;
END;
GO

-- Grant execute permissions (adjust as needed for your security model)
-- GRANT EXECUTE ON sp_GetDashboardSummary TO [JobManagementUsers];
-- GRANT EXECUTE ON sp_CreateJobWithDescription TO [JobManagementUsers];
-- ... (add other GRANT statements as needed)

PRINT 'Job Management System stored procedures created successfully.';