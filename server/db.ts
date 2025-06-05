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
    encrypt: process.env.NODE_ENV === 'production',
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

// Initialize database connection
initializeDatabase().catch(console.error);