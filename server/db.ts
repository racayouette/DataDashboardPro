import sql from 'mssql';
import * as schema from "@shared/schema";

// SQL Server configuration
const config: sql.config = {
  server: process.env.MSSQL_SERVER || 'localhost',
  database: process.env.MSSQL_DATABASE || 'advent_ai_db',
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || 'YourPassword123!',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  options: {
    encrypt: true, // Always use encryption for SQL Server
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool: sql.ConnectionPool;

export async function initializeDatabase() {
  try {
    pool = await new sql.ConnectionPool(config).connect();
    console.log('Connected to SQL Server');
    
    // Create database and tables if they don't exist
    await createTablesIfNotExists();
    
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    // Fallback to mock data if SQL Server is not available
    console.log('Using in-memory storage as fallback');
    return null;
  }
}

async function createTablesIfNotExists() {
  if (!pool) return;
  
  try {
    const request = pool.request();
    
    // Create dashboard_summary table
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='dashboard_summary' AND xtype='U')
      CREATE TABLE dashboard_summary (
        id INT IDENTITY(1,1) PRIMARY KEY,
        total_users INT NOT NULL,
        revenue NVARCHAR(50) NOT NULL,
        orders INT NOT NULL,
        growth_rate NVARCHAR(10) NOT NULL,
        jobs_reviewed INT NOT NULL DEFAULT 0,
        in_progress INT NOT NULL DEFAULT 0,
        not_started INT NOT NULL DEFAULT 0,
        updated_at DATETIME2 DEFAULT GETDATE()
      )
    `);
    
    // Create transactions table
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='transactions' AND xtype='U')
      CREATE TABLE transactions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        customer_name NVARCHAR(255) NOT NULL,
        customer_email NVARCHAR(255) NOT NULL,
        amount NVARCHAR(50) NOT NULL,
        status NVARCHAR(50) NOT NULL,
        description NVARCHAR(MAX),
        date DATETIME2 DEFAULT GETDATE()
      )
    `);
    
    // Create job_families table
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='job_families' AND xtype='U')
      CREATE TABLE job_families (
        id INT IDENTITY(1,1) PRIMARY KEY,
        job_family NVARCHAR(255) NOT NULL,
        total_jobs INT NOT NULL,
        jobs_reviewed INT NOT NULL,
        description NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
      )
    `);
    
    // Create reviewers table
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='reviewers' AND xtype='U')
      CREATE TABLE reviewers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        job_family NVARCHAR(255) NOT NULL,
        completed INT NOT NULL,
        in_progress INT NOT NULL,
        responsible NVARCHAR(255) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
      )
    `);
    
    // Create users table
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        role NVARCHAR(50) NOT NULL,
        department NVARCHAR(255),
        status NVARCHAR(50) DEFAULT 'Active',
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
      )
    `);
    
    console.log('SQL Server tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
}

export function getPool() {
  return pool;
}

export async function executeQuery(query: string, params?: any[]) {
  if (!pool) {
    throw new Error('Database not available');
  }
  
  const request = pool.request();
  if (params) {
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });
  }
  
  return await request.query(query);
}

// Initialize database connection and populate with sample data
initializeDatabase().then(async (connectedPool) => {
  if (connectedPool) {
    await populateSampleData();
  }
}).catch(console.error);

async function populateSampleData() {
  if (!pool) return;
  
  try {
    // Check if data already exists
    const existingData = await executeQuery('SELECT COUNT(*) as count FROM dashboard_summary');
    if (existingData.recordset[0].count > 0) {
      console.log('Sample data already exists');
      return;
    }
    
    // Insert dashboard summary
    await executeQuery(`
      INSERT INTO dashboard_summary (total_users, revenue, orders, growth_rate, jobs_reviewed, in_progress, not_started)
      VALUES (9000, '712', 132, '56', 145, 87, 43)
    `);
    
    // Insert transactions
    await executeQuery(`
      INSERT INTO transactions (customer_name, customer_email, amount, status, description) VALUES
      ('Sarah Miller', 'sarah@example.com', '2450.00', 'Completed', 'Software license renewal'),
      ('John Davis', 'john@example.com', '1250.00', 'Pending', 'Consulting services'),
      ('Alice Brown', 'alice@example.com', '875.50', 'Completed', 'Training program'),
      ('Mike Wilson', 'mike@example.com', '3200.00', 'Failed', 'Enterprise package'),
      ('Emma Johnson', 'emma@example.com', '1875.25', 'Completed', 'Implementation services'),
      ('David Lee', 'david@example.com', '950.75', 'Pending', 'Support contract'),
      ('Jessica Chen', 'jessica@example.com', '3450.00', 'Completed', 'Custom development'),
      ('Robert Taylor', 'robert@example.com', '2100.50', 'Failed', 'Platform upgrade'),
      ('Lisa Wang', 'lisa@example.com', '1650.00', 'Completed', 'Data migration'),
      ('Michael Brown', 'michael@example.com', '775.25', 'Pending', 'Maintenance package'),
      ('Anna Martinez', 'anna@example.com', '2850.75', 'Completed', 'Integration services'),
      ('James Garcia', 'james@example.com', '1425.50', 'Failed', 'Security audit')
    `);
    
    // Insert job families
    await executeQuery(`
      INSERT INTO job_families (job_family, total_jobs, jobs_reviewed, description) VALUES
      ('Clinical Support', 185, 145, 'Healthcare support and clinical operations'),
      ('Finance', 95, 60, 'Financial planning and accounting services'),
      ('IT Services', 60, 45, 'Technology support and infrastructure'),
      ('Lab Services', 40, 10, 'Laboratory testing and analysis'),
      ('Human Resources', 75, 55, 'HR management and employee services'),
      ('Operations', 120, 85, 'Business operations and process management'),
      ('Marketing', 45, 30, 'Marketing and communications'),
      ('Research & Development', 80, 65, 'Product research and development'),
      ('Quality Assurance', 35, 25, 'Quality control and testing'),
      ('Customer Service', 90, 70, 'Customer support and relations')
    `);
    
    // Insert reviewers
    await executeQuery(`
      INSERT INTO reviewers (job_family, completed, in_progress, responsible) VALUES
      ('Sarah Mitchell', 82, 5, 'James Patterson'),
      ('Kelly Johnson', 67, 12, 'Maria Rodriguez'),
      ('Robert Kennedy', 12, 18, 'Lisa Thompson'),
      ('Adam Lambert', 33, 4, 'Daniel Wilson'),
      ('Jennifer Williams', 45, 8, 'Nancy Davis'),
      ('Michael Roberts', 38, 15, 'Steven Clark'),
      ('Linda Taylor', 56, 6, 'Karen Miller'),
      ('David Phillips', 29, 11, 'Patricia Moore'),
      ('Emma Sullivan', 41, 9, 'Richard Garcia'),
      ('Chris Harrison', 52, 7, 'Michelle Brown')
    `);
    
    // Insert users
    await executeQuery(`
      INSERT INTO users (name, email, role, department, status) VALUES
      ('Sarah Mitchell', 'sarah.mitchell@adventai.com', 'HR Manager', 'Human Resources', 'Active'),
      ('James Patterson', 'james.patterson@adventai.com', 'Admin', 'IT Services', 'Active'),
      ('Maria Rodriguez', 'maria.rodriguez@adventai.com', 'Reviewer', 'Clinical Support', 'Active'),
      ('Lisa Thompson', 'lisa.thompson@adventai.com', 'Reviewer', 'Finance', 'Active'),
      ('Daniel Wilson', 'daniel.wilson@adventai.com', 'Employee', 'Operations', 'Active'),
      ('Nancy Davis', 'nancy.davis@adventai.com', 'Reviewer', 'Lab Services', 'Active'),
      ('Steven Clark', 'steven.clark@adventai.com', 'HR Manager', 'Human Resources', 'Active'),
      ('Karen Miller', 'karen.miller@adventai.com', 'Employee', 'Marketing', 'Active'),
      ('Patricia Moore', 'patricia.moore@adventai.com', 'Reviewer', 'Research & Development', 'Active'),
      ('Richard Garcia', 'richard.garcia@adventai.com', 'Employee', 'Quality Assurance', 'Active'),
      ('Michelle Brown', 'michelle.brown@adventai.com', 'Reviewer', 'Customer Service', 'Active'),
      ('Kelly Johnson', 'kelly.johnson@adventai.com', 'Reviewer', 'Clinical Support', 'Active'),
      ('Robert Kennedy', 'robert.kennedy@adventai.com', 'Employee', 'IT Services', 'Inactive'),
      ('Adam Lambert', 'adam.lambert@adventai.com', 'Employee', 'Finance', 'Active'),
      ('Jennifer Williams', 'jennifer.williams@adventai.com', 'HR Manager', 'Human Resources', 'Active')
    `);
    
    console.log('Sample data populated successfully');
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
}