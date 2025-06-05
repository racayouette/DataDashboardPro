import { 
  dashboardSummary, 
  transactions, 
  jobFamilies,
  reviewers,
  users,
  jobs,
  jobDescriptions,
  essentialFunctions,
  notifications,
  jobDescriptionChanges,
  auditLog,
  type DashboardSummary,
  type Transaction,
  type JobFamily,
  type Reviewer,
  type User,
  type Job,
  type JobDescription,
  type EssentialFunction,
  type Notification,
  type JobDescriptionChange,
  type AuditLog,
  type InsertDashboardSummary,
  type InsertTransaction,
  type InsertJobFamily,
  type InsertReviewer,
  type InsertUser,
  type InsertJob,
  type InsertJobDescription,
  type InsertEssentialFunction,
  type InsertNotification,
  type InsertJobDescriptionChange,
  type InsertAuditLog
} from "@shared/schema";
import { getPool, executeQuery } from "./db";
import sql from 'mssql';

export interface IStorage {
  // Dashboard and summary data
  getDashboardSummary(): Promise<DashboardSummary | undefined>;
  getRecentTransactions(page?: number, limit?: number): Promise<{ transactions: Transaction[], total: number, totalPages: number, currentPage: number }>;
  getJobFamilies(page?: number, limit?: number): Promise<{ jobFamilies: JobFamily[], total: number, totalPages: number, currentPage: number }>;
  getReviewers(page?: number, limit?: number): Promise<{ reviewers: Reviewer[], total: number, totalPages: number, currentPage: number }>;
  createDashboardSummary(summary: InsertDashboardSummary): Promise<DashboardSummary>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createJobFamily(jobFamily: InsertJobFamily): Promise<JobFamily>;
  createReviewer(reviewer: InsertReviewer): Promise<Reviewer>;
  
  // User management
  getUsers(page?: number, limit?: number): Promise<{ users: User[], total: number, totalPages: number, currentPage: number }>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Job management
  getJobs(page?: number, limit?: number, filters?: { reviewer?: string, status?: string }): Promise<{ jobs: Job[], total: number, totalPages: number, currentPage: number }>;
  getJobById(id: number): Promise<Job | undefined>;
  getJobByCode(code: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  
  // Job descriptions
  getJobDescriptions(jobId: number): Promise<JobDescription[]>;
  getJobDescriptionById(id: number): Promise<JobDescription | undefined>;
  getActiveJobDescription(jobId: number): Promise<JobDescription | undefined>;
  createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription>;
  updateJobDescription(id: number, jobDescription: Partial<InsertJobDescription>): Promise<JobDescription>;
  
  // Essential functions
  getEssentialFunctions(jobDescriptionId: number): Promise<EssentialFunction[]>;
  createEssentialFunction(essentialFunction: InsertEssentialFunction): Promise<EssentialFunction>;
  updateEssentialFunction(id: number, essentialFunction: Partial<InsertEssentialFunction>): Promise<EssentialFunction>;
  deleteEssentialFunction(id: number): Promise<void>;
  reorderEssentialFunctions(jobDescriptionId: number, functionIds: number[]): Promise<void>;
  
  // Notifications
  getNotifications(userId?: number, page?: number, limit?: number): Promise<{ notifications: Notification[], total: number, totalPages: number, currentPage: number }>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  
  // Track changes
  getJobDescriptionChanges(jobDescriptionId: number): Promise<JobDescriptionChange[]>;
  createJobDescriptionChange(change: InsertJobDescriptionChange): Promise<JobDescriptionChange>;
  
  // Audit log
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(page?: number, limit?: number): Promise<{ logs: AuditLog[], total: number, totalPages: number, currentPage: number }>;
}

export class MemStorage implements IStorage {
  private dashboardSummaries: Map<number, DashboardSummary>;
  private transactionsList: Map<number, Transaction>;
  private jobFamiliesList: Map<number, JobFamily>;
  private reviewersList: Map<number, Reviewer>;
  private currentSummaryId: number;
  private currentTransactionId: number;
  private currentJobFamilyId: number;
  private currentReviewerId: number;

  constructor() {
    this.dashboardSummaries = new Map();
    this.transactionsList = new Map();
    this.jobFamiliesList = new Map();
    this.reviewersList = new Map();
    this.currentSummaryId = 1;
    this.currentTransactionId = 1;
    this.currentJobFamilyId = 1;
    this.currentReviewerId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create dashboard summary
    const summary: DashboardSummary = {
      id: this.currentSummaryId++,
      totalUsers: 9000,
      revenue: "712",
      orders: 132,
      growthRate: "56",
      updatedAt: new Date(),
    };
    this.dashboardSummaries.set(summary.id, summary);

    // Create transactions
    const sampleTransactions: Omit<Transaction, 'id'>[] = [
      {
        customerName: "Sarah Miller",
        customerEmail: "sarah@example.com",
        amount: "2450.00",
        status: "Completed",
        date: new Date("2024-03-15"),
      },
      {
        customerName: "John Davis",
        customerEmail: "john@example.com",
        amount: "1250.00",
        status: "Pending",
        date: new Date("2024-03-14"),
      },
      {
        customerName: "Alice Brown",
        customerEmail: "alice@example.com",
        amount: "875.50",
        status: "Completed",
        date: new Date("2024-03-13"),
      },
      {
        customerName: "Mike Wilson",
        customerEmail: "mike@example.com",
        amount: "3200.00",
        status: "Failed",
        date: new Date("2024-03-12"),
      },
      {
        customerName: "Emma Johnson",
        customerEmail: "emma@example.com",
        amount: "1875.25",
        status: "Completed",
        date: new Date("2024-03-11"),
      },
      {
        customerName: "David Lee",
        customerEmail: "david@example.com",
        amount: "950.75",
        status: "Pending",
        date: new Date("2024-03-10"),
      },
      {
        customerName: "Jessica Chen",
        customerEmail: "jessica@example.com",
        amount: "3450.00",
        status: "Completed",
        date: new Date("2024-03-09"),
      },
      {
        customerName: "Robert Taylor",
        customerEmail: "robert@example.com",
        amount: "2100.50",
        status: "Failed",
        date: new Date("2024-03-08"),
      },
      {
        customerName: "Lisa Wang",
        customerEmail: "lisa@example.com",
        amount: "1650.00",
        status: "Completed",
        date: new Date("2024-03-07"),
      },
      {
        customerName: "Michael Brown",
        customerEmail: "michael@example.com",
        amount: "775.25",
        status: "Pending",
        date: new Date("2024-03-06"),
      },
      {
        customerName: "Anna Martinez",
        customerEmail: "anna@example.com",
        amount: "2850.75",
        status: "Completed",
        date: new Date("2024-03-05"),
      },
      {
        customerName: "James Garcia",
        customerEmail: "james@example.com",
        amount: "1425.50",
        status: "Failed",
        date: new Date("2024-03-04"),
      },
    ];

    sampleTransactions.forEach(transaction => {
      const fullTransaction: Transaction = {
        ...transaction,
        id: this.currentTransactionId++,
      };
      this.transactionsList.set(fullTransaction.id, fullTransaction);
    });

    // Create job families
    const sampleJobFamilies: Omit<JobFamily, 'id'>[] = [
      {
        jobFamily: "Clinical Support",
        totalJobs: 185,
        jobsReviewed: 145,
      },
      {
        jobFamily: "Finance",
        totalJobs: 95,
        jobsReviewed: 60,
      },
      {
        jobFamily: "IT Services",
        totalJobs: 60,
        jobsReviewed: 45,
      },
      {
        jobFamily: "Lab Services",
        totalJobs: 40,
        jobsReviewed: 10,
      },
      {
        jobFamily: "Human Resources",
        totalJobs: 75,
        jobsReviewed: 55,
      },
      {
        jobFamily: "Operations",
        totalJobs: 120,
        jobsReviewed: 85,
      },
      {
        jobFamily: "Marketing",
        totalJobs: 45,
        jobsReviewed: 30,
      },
      {
        jobFamily: "Research & Development",
        totalJobs: 80,
        jobsReviewed: 65,
      },
      {
        jobFamily: "Quality Assurance",
        totalJobs: 35,
        jobsReviewed: 25,
      },
      {
        jobFamily: "Customer Service",
        totalJobs: 90,
        jobsReviewed: 70,
      },
    ];

    sampleJobFamilies.forEach(jobFamily => {
      const fullJobFamily: JobFamily = {
        ...jobFamily,
        id: this.currentJobFamilyId++,
      };
      this.jobFamiliesList.set(fullJobFamily.id, fullJobFamily);
    });

    // Create reviewers
    const sampleReviewers: Omit<Reviewer, 'id'>[] = [
      {
        jobFamily: "Sarah Mitchell",
        completed: 82,
        inProgress: 5,
        responsible: "James Patterson",
      },
      {
        jobFamily: "Kelly Johnson",
        completed: 67,
        inProgress: 12,
        responsible: "Maria Rodriguez",
      },
      {
        jobFamily: "Robert Kennedy",
        completed: 12,
        inProgress: 18,
        responsible: "Lisa Thompson",
      },
      {
        jobFamily: "Adam Lambert",
        completed: 33,
        inProgress: 4,
        responsible: "Daniel Wilson",
      },
      {
        jobFamily: "Jennifer Williams",
        completed: 45,
        inProgress: 8,
        responsible: "Nancy Davis",
      },
      {
        jobFamily: "Michael Roberts",
        completed: 38,
        inProgress: 15,
        responsible: "Steven Clark",
      },
      {
        jobFamily: "Linda Taylor",
        completed: 56,
        inProgress: 6,
        responsible: "Karen Miller",
      },
      {
        jobFamily: "David Phillips",
        completed: 29,
        inProgress: 11,
        responsible: "Patricia Moore",
      },
      {
        jobFamily: "Emma Sullivan",
        completed: 41,
        inProgress: 9,
        responsible: "Richard Garcia",
      },
      {
        jobFamily: "Chris Harrison",
        completed: 52,
        inProgress: 7,
        responsible: "Michelle Brown",
      },
    ];

    sampleReviewers.forEach(reviewer => {
      const fullReviewer: Reviewer = {
        ...reviewer,
        id: this.currentReviewerId++,
      };
      this.reviewersList.set(fullReviewer.id, fullReviewer);
    });
  }

  async getDashboardSummary(): Promise<DashboardSummary | undefined> {
    return Array.from(this.dashboardSummaries.values())[0];
  }

  async getRecentTransactions(page: number = 1, limit: number = 4): Promise<{ transactions: Transaction[], total: number, totalPages: number, currentPage: number }> {
    const allTransactions = Array.from(this.transactionsList.values());
    const sortedTransactions = allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const total = sortedTransactions.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const transactions = sortedTransactions.slice(startIndex, endIndex);

    return {
      transactions,
      total,
      totalPages,
      currentPage: page
    };
  }

  async getJobFamilies(page: number = 1, limit: number = 4): Promise<{ jobFamilies: JobFamily[], total: number, totalPages: number, currentPage: number }> {
    const allJobFamilies = Array.from(this.jobFamiliesList.values());
    const sortedJobFamilies = allJobFamilies
      .sort((a, b) => b.totalJobs - a.totalJobs);
    
    const total = sortedJobFamilies.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const jobFamilies = sortedJobFamilies.slice(startIndex, endIndex);

    return {
      jobFamilies,
      total,
      totalPages,
      currentPage: page
    };
  }

  async getReviewers(page: number = 1, limit: number = 4): Promise<{ reviewers: Reviewer[], total: number, totalPages: number, currentPage: number }> {
    const allReviewers = Array.from(this.reviewersList.values());
    const sortedReviewers = allReviewers
      .sort((a, b) => b.completed - a.completed);
    
    const total = sortedReviewers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const reviewers = sortedReviewers.slice(startIndex, endIndex);

    return {
      reviewers,
      total,
      totalPages,
      currentPage: page
    };
  }

  async createDashboardSummary(insertSummary: InsertDashboardSummary): Promise<DashboardSummary> {
    const id = this.currentSummaryId++;
    const summary: DashboardSummary = { 
      ...insertSummary, 
      id,
      updatedAt: new Date(),
    };
    this.dashboardSummaries.set(id, summary);
    return summary;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      date: new Date(),
    };
    this.transactionsList.set(id, transaction);
    return transaction;
  }

  async createJobFamily(insertJobFamily: InsertJobFamily): Promise<JobFamily> {
    const id = this.currentJobFamilyId++;
    const jobFamily: JobFamily = { ...insertJobFamily, id };
    this.jobFamiliesList.set(id, jobFamily);
    return jobFamily;
  }

  async createReviewer(insertReviewer: InsertReviewer): Promise<Reviewer> {
    const id = this.currentReviewerId++;
    const reviewer: Reviewer = { ...insertReviewer, id };
    this.reviewersList.set(id, reviewer);
    return reviewer;
  }
}

export class SQLServerStorage implements IStorage {
  // Dashboard and summary data
  async getDashboardSummary(): Promise<DashboardSummary | undefined> {
    try {
      const pool = getPool();
      if (!pool) {
        // Fallback to in-memory data if SQL Server is not available
        return new MemStorage().getDashboardSummary();
      }
      
      const result = await executeQuery('SELECT TOP 1 * FROM dashboard_summary ORDER BY id DESC');
      return result.recordset[0] || undefined;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return new MemStorage().getDashboardSummary();
    }
  }

  async getRecentTransactions(page: number = 1, limit: number = 4): Promise<{ transactions: Transaction[], total: number, totalPages: number, currentPage: number }> {
    try {
      const pool = getPool();
      if (!pool) {
        return new MemStorage().getRecentTransactions(page, limit);
      }
      
      const offset = (page - 1) * limit;
      const [transactionsResult, countResult] = await Promise.all([
        executeQuery(`SELECT * FROM transactions ORDER BY date DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`),
        executeQuery('SELECT COUNT(*) as total FROM transactions')
      ]);
      
      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / limit);
      
      return {
        transactions: transactionsResult.recordset,
        total,
        totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return new MemStorage().getRecentTransactions(page, limit);
    }
  }

  async getJobFamilies(page: number = 1, limit: number = 4): Promise<{ jobFamilies: JobFamily[], total: number, totalPages: number, currentPage: number }> {
    try {
      const pool = getPool();
      if (!pool) {
        return new MemStorage().getJobFamilies(page, limit);
      }
      
      const offset = (page - 1) * limit;
      const [jobFamiliesResult, countResult] = await Promise.all([
        executeQuery(`SELECT * FROM job_families ORDER BY total_jobs DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`),
        executeQuery('SELECT COUNT(*) as total FROM job_families')
      ]);
      
      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / limit);
      
      return {
        jobFamilies: jobFamiliesResult.recordset,
        total,
        totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching job families:', error);
      return new MemStorage().getJobFamilies(page, limit);
    }
  }

  async getReviewers(page: number = 1, limit: number = 4): Promise<{ reviewers: Reviewer[], total: number, totalPages: number, currentPage: number }> {
    try {
      const pool = getPool();
      if (!pool) {
        return new MemStorage().getReviewers(page, limit);
      }
      
      const offset = (page - 1) * limit;
      const [reviewersResult, countResult] = await Promise.all([
        executeQuery(`SELECT * FROM reviewers ORDER BY completed DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`),
        executeQuery('SELECT COUNT(*) as total FROM reviewers')
      ]);
      
      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / limit);
      
      return {
        reviewers: reviewersResult.recordset,
        total,
        totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching reviewers:', error);
      return new MemStorage().getReviewers(page, limit);
    }
  }

  async createDashboardSummary(summary: InsertDashboardSummary): Promise<DashboardSummary> {
    try {
      const pool = getPool();
      if (!pool) {
        return new MemStorage().createDashboardSummary(summary);
      }
      
      const result = await executeQuery(`
        INSERT INTO dashboard_summary (total_users, revenue, orders, growth_rate, jobs_reviewed, in_progress, not_started)
        OUTPUT INSERTED.*
        VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6)
      `, [summary.totalUsers, summary.revenue, summary.orders, summary.growthRate, summary.jobsReviewed, summary.inProgress, summary.notStarted]);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating dashboard summary:', error);
      return new MemStorage().createDashboardSummary(summary);
    }
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    try {
      const pool = getPool();
      if (!pool) {
        return new MemStorage().createTransaction(transaction);
      }
      
      const result = await executeQuery(`
        INSERT INTO transactions (customer_name, customer_email, amount, status, description)
        OUTPUT INSERTED.*
        VALUES (@param0, @param1, @param2, @param3, @param4)
      `, [transaction.customerName, transaction.customerEmail, transaction.amount, transaction.status, transaction.description]);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating transaction:', error);
      return new MemStorage().createTransaction(transaction);
    }
  }

  async createJobFamily(jobFamily: InsertJobFamily): Promise<JobFamily> {
    try {
      const pool = getPool();
      if (!pool) {
        return new MemStorage().createJobFamily(jobFamily);
      }
      
      const result = await executeQuery(`
        INSERT INTO job_families (job_family, total_jobs, jobs_reviewed, description)
        OUTPUT INSERTED.*
        VALUES (@param0, @param1, @param2, @param3)
      `, [jobFamily.jobFamily, jobFamily.totalJobs, jobFamily.jobsReviewed, jobFamily.description]);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating job family:', error);
      return new MemStorage().createJobFamily(jobFamily);
    }
  }

  async createReviewer(reviewer: InsertReviewer): Promise<Reviewer> {
    try {
      const pool = getPool();
      if (!pool) {
        return new MemStorage().createReviewer(reviewer);
      }
      
      const result = await executeQuery(`
        INSERT INTO reviewers (job_family, completed, in_progress, responsible)
        OUTPUT INSERTED.*
        VALUES (@param0, @param1, @param2, @param3)
      `, [reviewer.jobFamily, reviewer.completed, reviewer.inProgress, reviewer.responsible]);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating reviewer:', error);
      return new MemStorage().createReviewer(reviewer);
    }
  }

  // User management with SQL Server implementation
  async getUsers(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number, totalPages: number, currentPage: number }> {
    try {
      const pool = getPool();
      if (!pool) {
        return { users: [], total: 0, totalPages: 0, currentPage: page };
      }
      
      const offset = (page - 1) * limit;
      const [usersResult, countResult] = await Promise.all([
        executeQuery(`SELECT * FROM users ORDER BY name OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`),
        executeQuery('SELECT COUNT(*) as total FROM users')
      ]);
      
      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / limit);
      
      return {
        users: usersResult.recordset,
        total,
        totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0, totalPages: 0, currentPage: page };
    }
  }

  async getUserById(id: number): Promise<User | undefined> {
    try {
      const pool = getPool();
      if (!pool) return undefined;
      
      const result = await executeQuery('SELECT * FROM users WHERE id = @param0', [id]);
      return result.recordset[0] || undefined;
    } catch (error) {
      console.error('Error fetching user by id:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const pool = getPool();
      if (!pool) return undefined;
      
      const result = await executeQuery('SELECT * FROM users WHERE email = @param0', [email]);
      return result.recordset[0] || undefined;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const pool = getPool();
      if (!pool) {
        throw new Error('Database not available');
      }
      
      const result = await executeQuery(`
        INSERT INTO users (name, email, role, department, status)
        OUTPUT INSERTED.*
        VALUES (@param0, @param1, @param2, @param3, @param4)
      `, [user.name, user.email, user.role, user.department, user.status || 'Active']);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    try {
      const pool = getPool();
      if (!pool) {
        throw new Error('Database not available');
      }
      
      const setParts = [];
      const params = [];
      let paramIndex = 0;
      
      if (user.name !== undefined) {
        setParts.push(`name = @param${paramIndex}`);
        params.push(user.name);
        paramIndex++;
      }
      if (user.email !== undefined) {
        setParts.push(`email = @param${paramIndex}`);
        params.push(user.email);
        paramIndex++;
      }
      if (user.role !== undefined) {
        setParts.push(`role = @param${paramIndex}`);
        params.push(user.role);
        paramIndex++;
      }
      if (user.department !== undefined) {
        setParts.push(`department = @param${paramIndex}`);
        params.push(user.department);
        paramIndex++;
      }
      if (user.status !== undefined) {
        setParts.push(`status = @param${paramIndex}`);
        params.push(user.status);
        paramIndex++;
      }
      
      params.push(id);
      
      const result = await executeQuery(`
        UPDATE users 
        SET ${setParts.join(', ')}, updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @param${paramIndex}
      `, params);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const pool = getPool();
      if (!pool) {
        throw new Error('Database not available');
      }
      
      await executeQuery('DELETE FROM users WHERE id = @param0', [id]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Stub implementations for other methods
  async getJobs(page: number = 1, limit: number = 10, filters?: { reviewer?: string, status?: string }): Promise<{ jobs: Job[], total: number, totalPages: number, currentPage: number }> {
    return { jobs: [], total: 0, totalPages: 0, currentPage: page };
  }

  async getJobById(id: number): Promise<Job | undefined> {
    return undefined;
  }

  async getJobByCode(code: string): Promise<Job | undefined> {
    return undefined;
  }

  async createJob(job: InsertJob): Promise<Job> {
    throw new Error('Method not implemented');
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job> {
    throw new Error('Method not implemented');
  }

  async deleteJob(id: number): Promise<void> {
    throw new Error('Method not implemented');
  }

  async getJobDescriptions(jobId: number): Promise<JobDescription[]> {
    return [];
  }

  async getJobDescriptionById(id: number): Promise<JobDescription | undefined> {
    return undefined;
  }

  async getActiveJobDescription(jobId: number): Promise<JobDescription | undefined> {
    return undefined;
  }

  async createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription> {
    throw new Error('Method not implemented');
  }

  async updateJobDescription(id: number, jobDescription: Partial<InsertJobDescription>): Promise<JobDescription> {
    throw new Error('Method not implemented');
  }

  async getEssentialFunctions(jobDescriptionId: number): Promise<EssentialFunction[]> {
    return [];
  }

  async createEssentialFunction(essentialFunction: InsertEssentialFunction): Promise<EssentialFunction> {
    throw new Error('Method not implemented');
  }

  async updateEssentialFunction(id: number, essentialFunction: Partial<InsertEssentialFunction>): Promise<EssentialFunction> {
    throw new Error('Method not implemented');
  }

  async deleteEssentialFunction(id: number): Promise<void> {
    throw new Error('Method not implemented');
  }

  async reorderEssentialFunctions(jobDescriptionId: number, functionIds: number[]): Promise<void> {
    throw new Error('Method not implemented');
  }

  async getNotifications(userId?: number, page: number = 1, limit: number = 10): Promise<{ notifications: Notification[], total: number, totalPages: number, currentPage: number }> {
    return { notifications: [], total: 0, totalPages: 0, currentPage: page };
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    throw new Error('Method not implemented');
  }

  async markNotificationAsRead(id: number): Promise<void> {
    throw new Error('Method not implemented');
  }

  async deleteNotification(id: number): Promise<void> {
    throw new Error('Method not implemented');
  }

  async getJobDescriptionChanges(jobDescriptionId: number): Promise<JobDescriptionChange[]> {
    return [];
  }

  async createJobDescriptionChange(change: InsertJobDescriptionChange): Promise<JobDescriptionChange> {
    throw new Error('Method not implemented');
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    throw new Error('Method not implemented');
  }

  async getAuditLogs(page: number = 1, limit: number = 10): Promise<{ logs: AuditLog[], total: number, totalPages: number, currentPage: number }> {
    return { logs: [], total: 0, totalPages: 0, currentPage: page };
  }
}

export const storage = new SQLServerStorage();
