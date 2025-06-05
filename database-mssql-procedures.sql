-- =============================================
-- Stored Procedures for Job Management System
-- Microsoft SQL Server Implementation
-- =============================================

-- =============================================
-- USER MANAGEMENT PROCEDURES
-- =============================================

-- Get user by ID
CREATE OR ALTER PROCEDURE sp_GetUserById
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, email, role, department, status, last_login, created_at, updated_at
    FROM users
    WHERE id = @UserId;
END;
GO

-- Get user by email
CREATE OR ALTER PROCEDURE sp_GetUserByEmail
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, email, role, department, status, last_login, created_at, updated_at
    FROM users
    WHERE email = @Email;
END;
GO

-- Create new user
CREATE OR ALTER PROCEDURE sp_CreateUser
    @Name NVARCHAR(255),
    @Email NVARCHAR(255),
    @Role NVARCHAR(50),
    @Department NVARCHAR(100),
    @Status NVARCHAR(20) = 'Active'
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO users (name, email, role, department, status)
    VALUES (@Name, @Email, @Role, @Department, @Status);
    
    SELECT SCOPE_IDENTITY() AS UserId;
END;
GO

-- Update user login time
CREATE OR ALTER PROCEDURE sp_UpdateUserLogin
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE users 
    SET last_login = GETUTCDATE()
    WHERE id = @UserId;
END;
GO

-- =============================================
-- JOB FAMILY PROCEDURES
-- =============================================

-- Get all job families with pagination
CREATE OR ALTER PROCEDURE sp_GetJobFamilies
    @Page INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    
    SELECT id, job_family, total_jobs, jobs_reviewed, description, created_at, updated_at
    FROM job_families
    ORDER BY job_family
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    -- Get total count
    SELECT COUNT(*) AS TotalCount FROM job_families;
END;
GO

-- Create job family
CREATE OR ALTER PROCEDURE sp_CreateJobFamily
    @JobFamily NVARCHAR(255),
    @Description NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO job_families (job_family, total_jobs, jobs_reviewed, description)
    VALUES (@JobFamily, 0, 0, @Description);
    
    SELECT SCOPE_IDENTITY() AS JobFamilyId;
END;
GO

-- =============================================
-- JOB MANAGEMENT PROCEDURES
-- =============================================

-- Get jobs with filters and pagination
CREATE OR ALTER PROCEDURE sp_GetJobs
    @Page INT = 1,
    @PageSize INT = 10,
    @ReviewerId INT = NULL,
    @Status NVARCHAR(50) = NULL,
    @JobFamilyId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    
    SELECT j.id, j.job_code, j.job_title, j.job_family_id, j.reviewer_id, j.responsible_id,
           j.status, j.last_updated, j.created_at, j.updated_at,
           jf.job_family, u1.name AS reviewer_name, u2.name AS responsible_name
    FROM jobs j
    LEFT JOIN job_families jf ON j.job_family_id = jf.id
    LEFT JOIN users u1 ON j.reviewer_id = u1.id
    LEFT JOIN users u2 ON j.responsible_id = u2.id
    WHERE (@ReviewerId IS NULL OR j.reviewer_id = @ReviewerId)
      AND (@Status IS NULL OR j.status = @Status)
      AND (@JobFamilyId IS NULL OR j.job_family_id = @JobFamilyId)
    ORDER BY j.created_at DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    -- Get total count
    SELECT COUNT(*) AS TotalCount 
    FROM jobs j
    WHERE (@ReviewerId IS NULL OR j.reviewer_id = @ReviewerId)
      AND (@Status IS NULL OR j.status = @Status)
      AND (@JobFamilyId IS NULL OR j.job_family_id = @JobFamilyId);
END;
GO

-- Create new job
CREATE OR ALTER PROCEDURE sp_CreateJob
    @JobCode NVARCHAR(50),
    @JobTitle NVARCHAR(255),
    @JobFamilyId INT,
    @ReviewerId INT = NULL,
    @ResponsibleId INT = NULL,
    @Status NVARCHAR(50) = 'Not Started'
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO jobs (job_code, job_title, job_family_id, reviewer_id, responsible_id, status)
    VALUES (@JobCode, @JobTitle, @JobFamilyId, @ReviewerId, @ResponsibleId, @Status);
    
    SELECT SCOPE_IDENTITY() AS JobId;
    
    -- Update job family totals
    UPDATE job_families 
    SET total_jobs = total_jobs + 1
    WHERE id = @JobFamilyId;
END;
GO

-- Update job status
CREATE OR ALTER PROCEDURE sp_UpdateJobStatus
    @JobId INT,
    @Status NVARCHAR(50),
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @OldStatus NVARCHAR(50);
    DECLARE @JobFamilyId INT;
    
    SELECT @OldStatus = status, @JobFamilyId = job_family_id
    FROM jobs WHERE id = @JobId;
    
    UPDATE jobs 
    SET status = @Status
    WHERE id = @JobId;
    
    -- Update job family reviewed count
    IF @Status = 'Reviewed' AND @OldStatus != 'Reviewed'
    BEGIN
        UPDATE job_families 
        SET jobs_reviewed = jobs_reviewed + 1
        WHERE id = @JobFamilyId;
    END
    ELSE IF @OldStatus = 'Reviewed' AND @Status != 'Reviewed'
    BEGIN
        UPDATE job_families 
        SET jobs_reviewed = jobs_reviewed - 1
        WHERE id = @JobFamilyId;
    END
    
    -- Log the change
    IF @UserId IS NOT NULL
    BEGIN
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
        VALUES (@UserId, 'UPDATE', 'Job', @JobId, 
                FORMATMESSAGE('{"field":"status","old_value":"%s","new_value":"%s"}', @OldStatus, @Status));
    END
END;
GO

-- =============================================
-- JOB DESCRIPTION PROCEDURES
-- =============================================

-- Get active job description for a job
CREATE OR ALTER PROCEDURE sp_GetActiveJobDescription
    @JobId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT jd.id, jd.job_id, jd.version, jd.job_summary, jd.original_job_summary,
           jd.last_edited_by_id, jd.last_updated_date, jd.is_active,
           jd.created_at, jd.updated_at, u.name AS last_edited_by_name
    FROM job_descriptions jd
    LEFT JOIN users u ON jd.last_edited_by_id = u.id
    WHERE jd.job_id = @JobId AND jd.is_active = 1;
END;
GO

-- Create new job description
CREATE OR ALTER PROCEDURE sp_CreateJobDescription
    @JobId INT,
    @JobSummary NVARCHAR(MAX),
    @LastEditedById INT = NULL,
    @Version INT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Deactivate previous versions
    UPDATE job_descriptions 
    SET is_active = 0
    WHERE job_id = @JobId;
    
    INSERT INTO job_descriptions (job_id, version, job_summary, original_job_summary, last_edited_by_id, is_active)
    VALUES (@JobId, @Version, @JobSummary, @JobSummary, @LastEditedById, 1);
    
    SELECT SCOPE_IDENTITY() AS JobDescriptionId;
END;
GO

-- Update job description
CREATE OR ALTER PROCEDURE sp_UpdateJobDescription
    @JobDescriptionId INT,
    @JobSummary NVARCHAR(MAX),
    @LastEditedById INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE job_descriptions 
    SET job_summary = @JobSummary,
        last_edited_by_id = @LastEditedById,
        last_updated_date = GETUTCDATE()
    WHERE id = @JobDescriptionId;
    
    -- Log the change
    INSERT INTO job_description_changes (job_description_id, change_type, field_name, new_value, user_id)
    VALUES (@JobDescriptionId, 'update', 'job_summary', @JobSummary, @LastEditedById);
END;
GO

-- =============================================
-- ESSENTIAL FUNCTIONS PROCEDURES
-- =============================================

-- Get essential functions for job description
CREATE OR ALTER PROCEDURE sp_GetEssentialFunctions
    @JobDescriptionId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, job_description_id, function_text, sort_order, has_edit, created_at, updated_at
    FROM essential_functions
    WHERE job_description_id = @JobDescriptionId
    ORDER BY sort_order;
END;
GO

-- Create essential function
CREATE OR ALTER PROCEDURE sp_CreateEssentialFunction
    @JobDescriptionId INT,
    @FunctionText NVARCHAR(MAX),
    @SortOrder INT,
    @HasEdit BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO essential_functions (job_description_id, function_text, sort_order, has_edit)
    VALUES (@JobDescriptionId, @FunctionText, @SortOrder, @HasEdit);
    
    SELECT SCOPE_IDENTITY() AS EssentialFunctionId;
END;
GO

-- Update essential function order
CREATE OR ALTER PROCEDURE sp_ReorderEssentialFunctions
    @JobDescriptionId INT,
    @FunctionIds NVARCHAR(MAX) -- Comma-separated list of IDs in new order
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @Order INT = 1;
    
    -- Create temporary table for reordering
    CREATE TABLE #TempOrder (FunctionId INT, NewOrder INT);
    
    -- Parse the comma-separated list and assign new order
    DECLARE @Id INT;
    DECLARE @Pos INT = 1;
    DECLARE @NextPos INT;
    
    WHILE @Pos <= LEN(@FunctionIds)
    BEGIN
        SET @NextPos = CHARINDEX(',', @FunctionIds, @Pos);
        IF @NextPos = 0 SET @NextPos = LEN(@FunctionIds) + 1;
        
        SET @Id = CAST(SUBSTRING(@FunctionIds, @Pos, @NextPos - @Pos) AS INT);
        INSERT INTO #TempOrder (FunctionId, NewOrder) VALUES (@Id, @Order);
        
        SET @Order = @Order + 1;
        SET @Pos = @NextPos + 1;
    END
    
    -- Update the sort order
    UPDATE ef
    SET sort_order = t.NewOrder
    FROM essential_functions ef
    INNER JOIN #TempOrder t ON ef.id = t.FunctionId
    WHERE ef.job_description_id = @JobDescriptionId;
    
    DROP TABLE #TempOrder;
END;
GO

-- =============================================
-- NOTIFICATION PROCEDURES
-- =============================================

-- Get notifications for user
CREATE OR ALTER PROCEDURE sp_GetNotifications
    @UserId INT = NULL,
    @Page INT = 1,
    @PageSize INT = 10,
    @OnlyUnread BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    
    SELECT id, user_id, title, message, type, category, priority, is_read, created_at, updated_at
    FROM notifications
    WHERE (@UserId IS NULL OR user_id = @UserId)
      AND (@OnlyUnread = 0 OR is_read = 0)
    ORDER BY created_at DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    -- Get total count
    SELECT COUNT(*) AS TotalCount
    FROM notifications
    WHERE (@UserId IS NULL OR user_id = @UserId)
      AND (@OnlyUnread = 0 OR is_read = 0);
END;
GO

-- Create notification
CREATE OR ALTER PROCEDURE sp_CreateNotification
    @UserId INT,
    @Title NVARCHAR(255),
    @Message NVARCHAR(MAX),
    @Type NVARCHAR(20),
    @Category NVARCHAR(50),
    @Priority NVARCHAR(10) = 'medium'
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO notifications (user_id, title, message, type, category, priority)
    VALUES (@UserId, @Title, @Message, @Type, @Category, @Priority);
    
    SELECT SCOPE_IDENTITY() AS NotificationId;
END;
GO

-- Mark notification as read
CREATE OR ALTER PROCEDURE sp_MarkNotificationAsRead
    @NotificationId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE notifications 
    SET is_read = 1
    WHERE id = @NotificationId;
END;
GO

-- =============================================
-- DASHBOARD PROCEDURES
-- =============================================

-- Get dashboard summary
CREATE OR ALTER PROCEDURE sp_GetDashboardSummary
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP 1 id, total_users, revenue, orders, growth_rate, 
           jobs_reviewed, in_progress, not_started, updated_at
    FROM dashboard_summary
    ORDER BY updated_at DESC;
END;
GO

-- Update dashboard summary
CREATE OR ALTER PROCEDURE sp_UpdateDashboardSummary
    @TotalUsers INT,
    @Revenue DECIMAL(12,2),
    @Orders INT,
    @GrowthRate DECIMAL(5,2),
    @JobsReviewed INT,
    @InProgress INT,
    @NotStarted INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Delete old summaries (keep only latest)
    DELETE FROM dashboard_summary;
    
    INSERT INTO dashboard_summary (total_users, revenue, orders, growth_rate, jobs_reviewed, in_progress, not_started)
    VALUES (@TotalUsers, @Revenue, @Orders, @GrowthRate, @JobsReviewed, @InProgress, @NotStarted);
    
    SELECT SCOPE_IDENTITY() AS SummaryId;
END;
GO

-- Get recent transactions
CREATE OR ALTER PROCEDURE sp_GetRecentTransactions
    @Page INT = 1,
    @PageSize INT = 4
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    
    SELECT id, customer_name, customer_email, amount, status, description, date
    FROM transactions
    ORDER BY date DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    -- Get total count
    SELECT COUNT(*) AS TotalCount FROM transactions;
END;
GO

-- =============================================
-- AUDIT AND CHANGE TRACKING PROCEDURES
-- =============================================

-- Log user action
CREATE OR ALTER PROCEDURE sp_LogUserAction
    @UserId INT,
    @Action NVARCHAR(100),
    @EntityType NVARCHAR(50),
    @EntityId INT = NULL,
    @Details NVARCHAR(MAX) = NULL,
    @IpAddress NVARCHAR(45) = NULL,
    @UserAgent NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
    VALUES (@UserId, @Action, @EntityType, @EntityId, @Details, @IpAddress, @UserAgent);
    
    SELECT SCOPE_IDENTITY() AS AuditLogId;
END;
GO

-- Get audit logs with pagination
CREATE OR ALTER PROCEDURE sp_GetAuditLogs
    @Page INT = 1,
    @PageSize INT = 10,
    @UserId INT = NULL,
    @EntityType NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    
    SELECT al.id, al.user_id, al.action, al.entity_type, al.entity_id,
           al.details, al.ip_address, al.user_agent, al.created_at,
           u.name AS user_name
    FROM audit_log al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE (@UserId IS NULL OR al.user_id = @UserId)
      AND (@EntityType IS NULL OR al.entity_type = @EntityType)
    ORDER BY al.created_at DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    -- Get total count
    SELECT COUNT(*) AS TotalCount
    FROM audit_log al
    WHERE (@UserId IS NULL OR al.user_id = @UserId)
      AND (@EntityType IS NULL OR al.entity_type = @EntityType);
END;
GO

PRINT 'Stored procedures created successfully!';