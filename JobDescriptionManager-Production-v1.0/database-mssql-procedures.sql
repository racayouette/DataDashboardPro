-- Stored Procedures for Job Description Manager - MS SQL Server
-- Run this after creating the schema and inserting sample data

USE JobDescriptionDB;
GO

-- Procedure to get user with roles
CREATE PROCEDURE sp_GetUserWithRoles
    @UserId NVARCHAR(50)
AS
BEGIN
    SELECT 
        u.id,
        u.email,
        u.firstName,
        u.lastName,
        u.profileImageUrl,
        u.createdAt,
        u.updatedAt,
        STRING_AGG(ur.role, ',') AS roles
    FROM users u
    LEFT JOIN userRoles ur ON u.id = ur.userId
    WHERE u.id = @UserId
    GROUP BY u.id, u.email, u.firstName, u.lastName, u.profileImageUrl, u.createdAt, u.updatedAt;
END;
GO

-- Procedure to get job descriptions with pagination
CREATE PROCEDURE sp_GetJobDescriptions
    @PageSize INT = 10,
    @PageNumber INT = 1,
    @Status NVARCHAR(50) = NULL,
    @Department NVARCHAR(255) = NULL
AS
BEGIN
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    SELECT 
        jd.id,
        jd.title,
        jd.department,
        jd.location,
        jd.employmentType,
        jd.salaryRange,
        jd.status,
        jd.version,
        jd.createdAt,
        jd.updatedAt,
        jf.name AS jobFamilyName,
        creator.firstName + ' ' + creator.lastName AS createdByName,
        approver.firstName + ' ' + approver.lastName AS approvedByName
    FROM jobDescriptions jd
    LEFT JOIN jobFamilies jf ON jd.jobFamilyId = jf.id
    LEFT JOIN users creator ON jd.createdBy = creator.id
    LEFT JOIN users approver ON jd.approvedBy = approver.id
    WHERE (@Status IS NULL OR jd.status = @Status)
      AND (@Department IS NULL OR jd.department = @Department)
    ORDER BY jd.updatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    -- Return total count
    SELECT COUNT(*) AS TotalCount
    FROM jobDescriptions jd
    WHERE (@Status IS NULL OR jd.status = @Status)
      AND (@Department IS NULL OR jd.department = @Department);
END;
GO

-- Procedure to create job description version
CREATE PROCEDURE sp_CreateJobDescriptionVersion
    @JobDescriptionId INT,
    @ModifiedBy NVARCHAR(50),
    @Changes NVARCHAR(MAX)
AS
BEGIN
    DECLARE @CurrentVersion INT;
    DECLARE @NewVersion INT;
    
    -- Get current version
    SELECT @CurrentVersion = version FROM jobDescriptions WHERE id = @JobDescriptionId;
    SET @NewVersion = @CurrentVersion + 1;
    
    -- Insert into history
    INSERT INTO jobDescriptionHistory (jobDescriptionId, version, title, description, requirements, benefits, changes, modifiedBy)
    SELECT 
        id,
        @CurrentVersion,
        title,
        description,
        requirements,
        benefits,
        @Changes,
        @ModifiedBy
    FROM jobDescriptions 
    WHERE id = @JobDescriptionId;
    
    -- Update version number
    UPDATE jobDescriptions 
    SET version = @NewVersion, updatedAt = GETDATE()
    WHERE id = @JobDescriptionId;
    
    SELECT @NewVersion AS NewVersion;
END;
GO

-- Procedure to get job description history
CREATE PROCEDURE sp_GetJobDescriptionHistory
    @JobDescriptionId INT
AS
BEGIN
    SELECT 
        jdh.id,
        jdh.version,
        jdh.title,
        jdh.description,
        jdh.requirements,
        jdh.benefits,
        jdh.changes,
        jdh.modifiedAt,
        u.firstName + ' ' + u.lastName AS modifiedByName
    FROM jobDescriptionHistory jdh
    LEFT JOIN users u ON jdh.modifiedBy = u.id
    WHERE jdh.jobDescriptionId = @JobDescriptionId
    ORDER BY jdh.version DESC;
END;
GO

-- Procedure to get dashboard statistics
CREATE PROCEDURE sp_GetDashboardStats
AS
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM jobDescriptions) AS totalJobs,
        (SELECT COUNT(*) FROM jobDescriptions WHERE status = 'Published') AS publishedJobs,
        (SELECT COUNT(*) FROM jobDescriptions WHERE status = 'Draft') AS draftJobs,
        (SELECT COUNT(*) FROM jobDescriptions WHERE status = 'Review') AS reviewJobs,
        (SELECT COUNT(*) FROM jobFamilies) AS totalJobFamilies,
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM notifications WHERE isRead = 0) AS unreadNotifications;
END;
GO

-- Procedure to search job descriptions
CREATE PROCEDURE sp_SearchJobDescriptions
    @SearchTerm NVARCHAR(255),
    @PageSize INT = 10,
    @PageNumber INT = 1
AS
BEGIN
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    SELECT 
        jd.id,
        jd.title,
        jd.department,
        jd.location,
        jd.employmentType,
        jd.status,
        jf.name AS jobFamilyName,
        creator.firstName + ' ' + creator.lastName AS createdByName
    FROM jobDescriptions jd
    LEFT JOIN jobFamilies jf ON jd.jobFamilyId = jf.id
    LEFT JOIN users creator ON jd.createdBy = creator.id
    WHERE jd.title LIKE '%' + @SearchTerm + '%'
       OR jd.description LIKE '%' + @SearchTerm + '%'
       OR jd.requirements LIKE '%' + @SearchTerm + '%'
       OR jd.department LIKE '%' + @SearchTerm + '%'
       OR jf.name LIKE '%' + @SearchTerm + '%'
    ORDER BY jd.updatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    -- Return total count
    SELECT COUNT(*) AS TotalCount
    FROM jobDescriptions jd
    LEFT JOIN jobFamilies jf ON jd.jobFamilyId = jf.id
    WHERE jd.title LIKE '%' + @SearchTerm + '%'
       OR jd.description LIKE '%' + @SearchTerm + '%'
       OR jd.requirements LIKE '%' + @SearchTerm + '%'
       OR jd.department LIKE '%' + @SearchTerm + '%'
       OR jf.name LIKE '%' + @SearchTerm + '%';
END;
GO

-- Procedure to manage notifications
CREATE PROCEDURE sp_CreateNotification
    @UserId NVARCHAR(50),
    @Title NVARCHAR(255),
    @Message NVARCHAR(MAX),
    @Type NVARCHAR(50) = 'info'
AS
BEGIN
    INSERT INTO notifications (userId, title, message, type)
    VALUES (@UserId, @Title, @Message, @Type);
    
    SELECT SCOPE_IDENTITY() AS NotificationId;
END;
GO

-- Procedure to mark notification as read
CREATE PROCEDURE sp_MarkNotificationRead
    @NotificationId INT,
    @UserId NVARCHAR(50)
AS
BEGIN
    UPDATE notifications 
    SET isRead = 1 
    WHERE id = @NotificationId AND userId = @UserId;
END;
GO

-- Procedure to get user notifications
CREATE PROCEDURE sp_GetUserNotifications
    @UserId NVARCHAR(50),
    @UnreadOnly BIT = 0
AS
BEGIN
    SELECT 
        id,
        title,
        message,
        type,
        isRead,
        createdAt
    FROM notifications
    WHERE userId = @UserId
      AND (@UnreadOnly = 0 OR isRead = 0)
    ORDER BY createdAt DESC;
END;
GO

-- Procedure to manage Active Directory configurations
CREATE PROCEDURE sp_UpsertActiveDirectoryConfig
    @Environment NVARCHAR(20),
    @ServerUrl NVARCHAR(500),
    @BaseDN NVARCHAR(500),
    @Username NVARCHAR(255),
    @Password NVARCHAR(255),
    @Domain NVARCHAR(255) = NULL,
    @Port INT = 389,
    @UseSSL BIT = 0,
    @IsActive BIT = 0
AS
BEGIN
    -- Deactivate other configs if this one is being activated
    IF @IsActive = 1
    BEGIN
        UPDATE activeDirectoryConfigs 
        SET isActive = 0 
        WHERE environment = @Environment;
    END
    
    -- Insert or update configuration
    MERGE activeDirectoryConfigs AS target
    USING (SELECT @Environment AS environment) AS source
    ON target.environment = source.environment
    WHEN MATCHED THEN
        UPDATE SET 
            serverUrl = @ServerUrl,
            baseDN = @BaseDN,
            username = @Username,
            password = @Password,
            domain = @Domain,
            port = @Port,
            useSSL = @UseSSL,
            isActive = @IsActive,
            updatedAt = GETDATE()
    WHEN NOT MATCHED THEN
        INSERT (environment, serverUrl, baseDN, username, password, domain, port, useSSL, isActive)
        VALUES (@Environment, @ServerUrl, @BaseDN, @Username, @Password, @Domain, @Port, @UseSSL, @IsActive);
    
    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- Procedure to get application settings
CREATE PROCEDURE sp_GetApplicationSettings
    @Category NVARCHAR(100) = NULL
AS
BEGIN
    SELECT 
        settingKey,
        settingValue,
        description,
        category
    FROM applicationSettings
    WHERE (@Category IS NULL OR category = @Category)
    ORDER BY category, settingKey;
END;
GO

-- Procedure to update application setting
CREATE PROCEDURE sp_UpdateApplicationSetting
    @SettingKey NVARCHAR(255),
    @SettingValue NVARCHAR(MAX)
AS
BEGIN
    UPDATE applicationSettings 
    SET settingValue = @SettingValue, updatedAt = GETDATE()
    WHERE settingKey = @SettingKey;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- Grant permissions to application user
GRANT EXECUTE ON sp_GetUserWithRoles TO jobapp;
GRANT EXECUTE ON sp_GetJobDescriptions TO jobapp;
GRANT EXECUTE ON sp_CreateJobDescriptionVersion TO jobapp;
GRANT EXECUTE ON sp_GetJobDescriptionHistory TO jobapp;
GRANT EXECUTE ON sp_GetDashboardStats TO jobapp;
GRANT EXECUTE ON sp_SearchJobDescriptions TO jobapp;
GRANT EXECUTE ON sp_CreateNotification TO jobapp;
GRANT EXECUTE ON sp_MarkNotificationRead TO jobapp;
GRANT EXECUTE ON sp_GetUserNotifications TO jobapp;
GRANT EXECUTE ON sp_UpsertActiveDirectoryConfig TO jobapp;
GRANT EXECUTE ON sp_GetApplicationSettings TO jobapp;
GRANT EXECUTE ON sp_UpdateApplicationSetting TO jobapp;
GO

PRINT 'Stored procedures created successfully!';
GO