-- Job Management System - PostgreSQL Stored Procedures
-- Created: 2025-06-07
-- Description: Stored procedures for the job description management platform

-- Procedure: Get dashboard summary with calculated metrics
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS TABLE (
    total_users INTEGER,
    revenue DECIMAL(12, 2),
    orders INTEGER,
    growth_rate DECIMAL(5, 2),
    jobs_reviewed INTEGER,
    in_progress INTEGER,
    not_started INTEGER,
    completed INTEGER,
    submitted_to_hr INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM users WHERE status = 'Active') as total_users,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE status = 'Completed'), 0) as revenue,
        (SELECT COUNT(*)::INTEGER FROM transactions) as orders,
        CASE 
            WHEN (SELECT COUNT(*) FROM jobs) > 0 
            THEN ((SELECT COUNT(*)::INTEGER FROM jobs WHERE status IN ('Completed', 'Reviewed')) * 100.0 / (SELECT COUNT(*) FROM jobs))::DECIMAL(5,2)
            ELSE 0.00
        END as growth_rate,
        (SELECT COUNT(*)::INTEGER FROM jobs WHERE status IN ('Completed', 'Reviewed')) as jobs_reviewed,
        (SELECT COUNT(*)::INTEGER FROM jobs WHERE status = 'In Progress') as in_progress,
        (SELECT COUNT(*)::INTEGER FROM jobs WHERE status = 'Not Started') as not_started,
        (SELECT COUNT(*)::INTEGER FROM jobs WHERE status = 'Completed') as completed,
        (SELECT COUNT(*)::INTEGER FROM jobs WHERE status = 'Submitted to HR') as submitted_to_hr;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Create new job with initial job description
CREATE OR REPLACE FUNCTION create_job_with_description(
    p_job_code TEXT,
    p_job_title TEXT,
    p_job_family_id INTEGER,
    p_reviewer_id INTEGER,
    p_responsible_id INTEGER,
    p_job_summary TEXT,
    p_created_by_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    v_job_id INTEGER;
    v_job_description_id INTEGER;
BEGIN
    -- Insert job
    INSERT INTO jobs (job_code, job_title, job_family_id, reviewer_id, responsible_id, status)
    VALUES (p_job_code, p_job_title, p_job_family_id, p_reviewer_id, p_responsible_id, 'Not Started')
    RETURNING id INTO v_job_id;
    
    -- Insert initial job description
    INSERT INTO job_descriptions (job_id, job_summary, original_job_summary, last_edited_by_id, version)
    VALUES (v_job_id, p_job_summary, p_job_summary, p_created_by_id, 1)
    RETURNING id INTO v_job_description_id;
    
    -- Log audit entry
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
    VALUES (p_created_by_id, 'CREATE', 'job', v_job_id, 
            json_build_object('job_code', p_job_code, 'job_title', p_job_title));
    
    RETURN v_job_id;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Update job description and create version history
CREATE OR REPLACE FUNCTION update_job_description(
    p_job_description_id INTEGER,
    p_job_summary TEXT,
    p_user_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    v_current_version INTEGER;
    v_new_version INTEGER;
    v_job_id INTEGER;
    v_old_summary TEXT;
BEGIN
    -- Get current version and job info
    SELECT version, job_id, job_summary 
    INTO v_current_version, v_job_id, v_old_summary
    FROM job_descriptions 
    WHERE id = p_job_description_id;
    
    -- Calculate new version
    v_new_version := v_current_version + 1;
    
    -- Mark current version as inactive
    UPDATE job_descriptions 
    SET is_active = FALSE 
    WHERE id = p_job_description_id;
    
    -- Create new version
    INSERT INTO job_descriptions (job_id, job_summary, original_job_summary, last_edited_by_id, version)
    SELECT job_id, p_job_summary, original_job_summary, p_user_id, v_new_version
    FROM job_descriptions 
    WHERE id = p_job_description_id
    RETURNING id INTO p_job_description_id;
    
    -- Log the change
    INSERT INTO job_description_changes (job_description_id, change_type, field_name, old_value, new_value, user_id)
    VALUES (p_job_description_id, 'update', 'job_summary', v_old_summary, p_job_summary, p_user_id);
    
    -- Update job last_updated
    UPDATE jobs SET last_updated = NOW() WHERE id = v_job_id;
    
    -- Log audit entry
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, 'UPDATE', 'job_description', p_job_description_id, 
            json_build_object('version', v_new_version));
    
    RETURN p_job_description_id;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Reorder essential functions
CREATE OR REPLACE FUNCTION reorder_essential_functions(
    p_job_description_id INTEGER,
    p_function_ids INTEGER[],
    p_user_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_function_id INTEGER;
    v_new_order INTEGER := 1;
BEGIN
    -- Update sort orders based on the provided array
    FOREACH v_function_id IN ARRAY p_function_ids
    LOOP
        UPDATE essential_functions 
        SET sort_order = v_new_order, updated_at = NOW()
        WHERE id = v_function_id AND job_description_id = p_job_description_id;
        
        v_new_order := v_new_order + 1;
    END LOOP;
    
    -- Log audit entry
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, 'REORDER', 'essential_functions', p_job_description_id, 
            json_build_object('function_ids', p_function_ids));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Get job with full details including descriptions and functions
CREATE OR REPLACE FUNCTION get_job_details(p_job_code TEXT)
RETURNS TABLE (
    job_id INTEGER,
    job_code TEXT,
    job_title TEXT,
    job_family TEXT,
    reviewer_name TEXT,
    responsible_name TEXT,
    status TEXT,
    last_updated TIMESTAMP,
    job_description_id INTEGER,
    job_summary TEXT,
    version INTEGER,
    last_edited_by TEXT,
    last_updated_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.job_code,
        j.job_title,
        jf.job_family,
        u1.name as reviewer_name,
        u2.name as responsible_name,
        j.status,
        j.last_updated,
        jd.id as job_description_id,
        jd.job_summary,
        jd.version,
        u3.name as last_edited_by,
        jd.last_updated_date
    FROM jobs j
    LEFT JOIN job_families jf ON j.job_family_id = jf.id
    LEFT JOIN users u1 ON j.reviewer_id = u1.id
    LEFT JOIN users u2 ON j.responsible_id = u2.id
    LEFT JOIN job_descriptions jd ON j.id = jd.job_id AND jd.is_active = TRUE
    LEFT JOIN users u3 ON jd.last_edited_by_id = u3.id
    WHERE j.job_code = p_job_code;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Get essential functions for a job description
CREATE OR REPLACE FUNCTION get_essential_functions(p_job_description_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    function_text TEXT,
    sort_order INTEGER,
    has_edit BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ef.id,
        ef.function_text,
        ef.sort_order,
        ef.has_edit,
        ef.created_at,
        ef.updated_at
    FROM essential_functions ef
    WHERE ef.job_description_id = p_job_description_id
    ORDER BY ef.sort_order;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Update job status with notification
CREATE OR REPLACE FUNCTION update_job_status(
    p_job_id INTEGER,
    p_new_status TEXT,
    p_user_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_old_status TEXT;
    v_job_code TEXT;
    v_job_title TEXT;
    v_reviewer_id INTEGER;
    v_responsible_id INTEGER;
BEGIN
    -- Get current job info
    SELECT status, job_code, job_title, reviewer_id, responsible_id
    INTO v_old_status, v_job_code, v_job_title, v_reviewer_id, v_responsible_id
    FROM jobs WHERE id = p_job_id;
    
    -- Update job status
    UPDATE jobs 
    SET status = p_new_status, last_updated = NOW()
    WHERE id = p_job_id;
    
    -- Create notifications based on status change
    IF p_new_status = 'Submitted to HR' THEN
        -- Notify HR team
        INSERT INTO notifications (user_id, title, message, type, category, priority)
        SELECT u.id, 'Job Submitted for HR Review', 
               'Job ' || v_job_code || ' (' || v_job_title || ') has been submitted for HR review',
               'info', 'job_status', 'medium'
        FROM users u 
        WHERE u.role = 'HR Manager' AND u.status = 'Active';
    END IF;
    
    IF p_new_status = 'Completed' THEN
        -- Notify reviewer and responsible person
        IF v_reviewer_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, message, type, category, priority)
            VALUES (v_reviewer_id, 'Job Completed', 
                   'Job ' || v_job_code || ' (' || v_job_title || ') has been completed',
                   'success', 'job_status', 'medium');
        END IF;
        
        IF v_responsible_id IS NOT NULL AND v_responsible_id != v_reviewer_id THEN
            INSERT INTO notifications (user_id, title, message, type, category, priority)
            VALUES (v_responsible_id, 'Job Completed', 
                   'Job ' || v_job_code || ' (' || v_job_title || ') has been completed',
                   'success', 'job_status', 'medium');
        END IF;
    END IF;
    
    -- Log audit entry
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, 'STATUS_CHANGE', 'job', p_job_id, 
            json_build_object('old_status', v_old_status, 'new_status', p_new_status));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Get user notifications with pagination
CREATE OR REPLACE FUNCTION get_user_notifications(
    p_user_id INTEGER,
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id INTEGER,
    title TEXT,
    message TEXT,
    type TEXT,
    category TEXT,
    priority TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMP,
    total_count BIGINT
) AS $$
DECLARE
    v_offset INTEGER;
BEGIN
    v_offset := (p_page - 1) * p_limit;
    
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.category,
        n.priority,
        n.is_read,
        n.created_at,
        COUNT(*) OVER() as total_count
    FROM notifications n
    WHERE n.user_id = p_user_id OR n.user_id IS NULL
    ORDER BY n.created_at DESC
    LIMIT p_limit OFFSET v_offset;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, updated_at = NOW()
    WHERE id = p_notification_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Get job families with statistics
CREATE OR REPLACE FUNCTION get_job_families_with_stats()
RETURNS TABLE (
    id INTEGER,
    job_family TEXT,
    total_jobs BIGINT,
    jobs_reviewed BIGINT,
    jobs_in_progress BIGINT,
    jobs_not_started BIGINT,
    jobs_completed BIGINT,
    jobs_submitted_to_hr BIGINT,
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jf.id,
        jf.job_family,
        COUNT(j.id) as total_jobs,
        COUNT(CASE WHEN j.status IN ('Completed', 'Reviewed') THEN 1 END) as jobs_reviewed,
        COUNT(CASE WHEN j.status = 'In Progress' THEN 1 END) as jobs_in_progress,
        COUNT(CASE WHEN j.status = 'Not Started' THEN 1 END) as jobs_not_started,
        COUNT(CASE WHEN j.status = 'Completed' THEN 1 END) as jobs_completed,
        COUNT(CASE WHEN j.status = 'Submitted to HR' THEN 1 END) as jobs_submitted_to_hr,
        jf.description,
        jf.created_at,
        jf.updated_at
    FROM job_families jf
    LEFT JOIN jobs j ON jf.id = j.job_family_id
    GROUP BY jf.id, jf.job_family, jf.description, jf.created_at, jf.updated_at
    ORDER BY jf.job_family;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Get audit trail for a specific entity
CREATE OR REPLACE FUNCTION get_audit_trail(
    p_entity_type TEXT,
    p_entity_id INTEGER,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id INTEGER,
    user_name TEXT,
    action TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        u.name as user_name,
        al.action,
        al.details,
        al.ip_address,
        al.created_at
    FROM audit_log al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.entity_type = p_entity_type 
    AND (p_entity_id IS NULL OR al.entity_id = p_entity_id)
    ORDER BY al.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Clean up old data (maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_data(p_days_to_keep INTEGER DEFAULT 90)
RETURNS TABLE (
    audit_logs_deleted INTEGER,
    old_notifications_deleted INTEGER,
    inactive_job_descriptions_deleted INTEGER
) AS $$
DECLARE
    v_audit_deleted INTEGER;
    v_notifications_deleted INTEGER;
    v_job_descriptions_deleted INTEGER;
BEGIN
    -- Delete old audit logs
    DELETE FROM audit_log 
    WHERE created_at < NOW() - INTERVAL '1 day' * p_days_to_keep;
    GET DIAGNOSTICS v_audit_deleted = ROW_COUNT;
    
    -- Delete old read notifications
    DELETE FROM notifications 
    WHERE is_read = TRUE AND created_at < NOW() - INTERVAL '1 day' * (p_days_to_keep / 2);
    GET DIAGNOSTICS v_notifications_deleted = ROW_COUNT;
    
    -- Delete old inactive job description versions (keep last 5 versions)
    DELETE FROM job_descriptions jd1
    WHERE is_active = FALSE 
    AND created_at < NOW() - INTERVAL '1 day' * p_days_to_keep
    AND (
        SELECT COUNT(*) 
        FROM job_descriptions jd2 
        WHERE jd2.job_id = jd1.job_id 
        AND jd2.version > jd1.version
    ) > 5;
    GET DIAGNOSTICS v_job_descriptions_deleted = ROW_COUNT;
    
    RETURN QUERY SELECT v_audit_deleted, v_notifications_deleted, v_job_descriptions_deleted;
END;
$$ LANGUAGE plpgsql;