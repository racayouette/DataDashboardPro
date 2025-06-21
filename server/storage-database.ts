import {
  DashboardSummary,
  InsertDashboardSummary,
  Transaction,
  InsertTransaction,
  JobFamily,
  InsertJobFamily,
  Reviewer,
  InsertReviewer,
  User,
  InsertUser,
  Job,
  InsertJob,
  JobDescription,
  InsertJobDescription,
  EssentialFunction,
  InsertEssentialFunction,
  Notification,
  InsertNotification,
  JobDescriptionChange,
  InsertJobDescriptionChange,
  AuditLog,
  InsertAuditLog,
  ActiveDirectoryConfig,
  InsertActiveDirectoryConfig,
  Configuration,
  InsertConfiguration
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql, ilike } from "drizzle-orm";
import * as schema from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Dashboard and summary data
  async getDashboardSummary(): Promise<DashboardSummary | undefined> {
    if (!db) return undefined;
    try {
      const [summary] = await db.select().from(schema.dashboardSummary).limit(1);
      return summary;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return undefined;
    }
  }

  async getRecentTransactions(page: number = 1, limit: number = 4): Promise<{
    transactions: Transaction[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    if (!db) return { transactions: [], total: 0, totalPages: 0, currentPage: 1 };
    
    try {
      const offset = (page - 1) * limit;
      const transactions = await db
        .select()
        .from(schema.transactions)
        .orderBy(desc(schema.transactions.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(schema.transactions);

      return {
        transactions,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { transactions: [], total: 0, totalPages: 0, currentPage: 1 };
    }
  }

  async getJobFamilies(page: number = 1, limit: number = 4): Promise<{
    jobFamilies: JobFamily[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    if (!db) return { jobFamilies: [], total: 0, totalPages: 0, currentPage: 1 };
    
    try {
      const offset = (page - 1) * limit;
      const jobFamilies = await db
        .select()
        .from(schema.jobFamilies)
        .orderBy(desc(schema.jobFamilies.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(schema.jobFamilies);

      return {
        jobFamilies,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching job families:', error);
      return { jobFamilies: [], total: 0, totalPages: 0, currentPage: 1 };
    }
  }

  async getReviewers(page: number = 1, limit: number = 4): Promise<{
    reviewers: Reviewer[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    if (!db) return { reviewers: [], total: 0, totalPages: 0, currentPage: 1 };
    
    try {
      const offset = (page - 1) * limit;
      const reviewers = await db
        .select()
        .from(schema.reviewers)
        .orderBy(desc(schema.reviewers.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(schema.reviewers);

      return {
        reviewers,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching reviewers:', error);
      return { reviewers: [], total: 0, totalPages: 0, currentPage: 1 };
    }
  }

  // Create operations
  async createDashboardSummary(summary: InsertDashboardSummary): Promise<DashboardSummary> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.dashboardSummary).values(summary).returning();
    return created;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.transactions).values(transaction).returning();
    return created;
  }

  async createJobFamily(jobFamily: InsertJobFamily): Promise<JobFamily> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.jobFamilies).values(jobFamily).returning();
    return created;
  }

  async createReviewer(reviewer: InsertReviewer): Promise<Reviewer> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.reviewers).values(reviewer).returning();
    return created;
  }

  // User management
  async getUsers(page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    if (!db) return { users: [], total: 0, totalPages: 0, currentPage: 1 };
    
    try {
      const offset = (page - 1) * limit;
      const users = await db
        .select()
        .from(schema.users)
        .orderBy(desc(schema.users.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(schema.users);

      return {
        users,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0, totalPages: 0, currentPage: 1 };
    }
  }

  async getUserById(id: number): Promise<User | undefined> {
    if (!db) return undefined;
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
      return user;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) return undefined;
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
      return user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.users).values(user).returning();
    return created;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    if (!db) throw new Error('Database not available');
    const [updated] = await db
      .update(schema.users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.delete(schema.users).where(eq(schema.users.id, id));
  }

  // Authentication methods
  async getReviewerByUsername(username: string): Promise<Reviewer | undefined> {
    if (!db) return undefined;
    try {
      const [reviewer] = await db
        .select()
        .from(schema.reviewers)
        .where(eq(schema.reviewers.username, username));
      return reviewer;
    } catch (error) {
      console.error('Error fetching reviewer by username:', error);
      return undefined;
    }
  }

  async createUserInReviewers(userData: { username: string; fullName: string; email: string }): Promise<Reviewer> {
    if (!db) throw new Error('Database not available');
    const reviewerData: InsertReviewer = {
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      department: 'HR',
      status: 'Active',
      jobsAssigned: 0,
      completedJobs: 0,
      lastLogin: new Date(),
    };
    const [created] = await db.insert(schema.reviewers).values(reviewerData).returning();
    return created;
  }

  // Job management
  async getJobs(page: number = 1, limit: number = 10): Promise<{
    jobs: Job[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    if (!db) return { jobs: [], total: 0, totalPages: 0, currentPage: 1 };
    
    try {
      const offset = (page - 1) * limit;
      const jobs = await db
        .select()
        .from(schema.jobs)
        .orderBy(desc(schema.jobs.lastUpdated))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(schema.jobs);

      return {
        jobs,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return { jobs: [], total: 0, totalPages: 0, currentPage: 1 };
    }
  }

  async getJobById(id: number): Promise<Job | undefined> {
    if (!db) return undefined;
    try {
      const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, id));
      return job;
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      return undefined;
    }
  }

  async createJob(job: InsertJob): Promise<Job> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.jobs).values(job).returning();
    return created;
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job> {
    if (!db) throw new Error('Database not available');
    const [updated] = await db
      .update(schema.jobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(schema.jobs.id, id))
      .returning();
    return updated;
  }

  async deleteJob(id: number): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.delete(schema.jobs).where(eq(schema.jobs.id, id));
  }

  // Job descriptions
  async getJobDescriptions(jobId: number): Promise<JobDescription[]> {
    if (!db) return [];
    try {
      return await db
        .select()
        .from(schema.jobDescriptions)
        .where(eq(schema.jobDescriptions.jobId, jobId))
        .orderBy(desc(schema.jobDescriptions.version));
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
      return [];
    }
  }

  async createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.jobDescriptions).values(jobDescription).returning();
    return created;
  }

  async updateJobDescription(id: number, jobDescription: Partial<InsertJobDescription>): Promise<JobDescription> {
    if (!db) throw new Error('Database not available');
    const [updated] = await db
      .update(schema.jobDescriptions)
      .set({ ...jobDescription, updatedAt: new Date() })
      .where(eq(schema.jobDescriptions.id, id))
      .returning();
    return updated;
  }

  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    if (!db) return [];
    try {
      return await db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.userId, userId))
        .orderBy(desc(schema.notifications.createdAt));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.notifications).values(notification).returning();
    return created;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db
      .update(schema.notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(schema.notifications.id, id));
  }

  // Essential functions
  async getEssentialFunctions(jobDescriptionId: number): Promise<EssentialFunction[]> {
    if (!db) return [];
    try {
      return await db
        .select()
        .from(schema.essentialFunctions)
        .where(eq(schema.essentialFunctions.jobDescriptionId, jobDescriptionId))
        .orderBy(schema.essentialFunctions.sortOrder);
    } catch (error) {
      console.error('Error fetching essential functions:', error);
      return [];
    }
  }

  async createEssentialFunction(essentialFunction: InsertEssentialFunction): Promise<EssentialFunction> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.essentialFunctions).values(essentialFunction).returning();
    return created;
  }

  async updateEssentialFunction(id: number, essentialFunction: Partial<InsertEssentialFunction>): Promise<EssentialFunction> {
    if (!db) throw new Error('Database not available');
    const [updated] = await db
      .update(schema.essentialFunctions)
      .set({ ...essentialFunction, updatedAt: new Date() })
      .where(eq(schema.essentialFunctions.id, id))
      .returning();
    return updated;
  }

  async deleteEssentialFunction(id: number): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.delete(schema.essentialFunctions).where(eq(schema.essentialFunctions.id, id));
  }

  // Job description changes
  async getJobDescriptionChanges(jobDescriptionId: number): Promise<JobDescriptionChange[]> {
    if (!db) return [];
    try {
      return await db
        .select()
        .from(schema.jobDescriptionChanges)
        .where(eq(schema.jobDescriptionChanges.jobDescriptionId, jobDescriptionId))
        .orderBy(desc(schema.jobDescriptionChanges.createdAt));
    } catch (error) {
      console.error('Error fetching job description changes:', error);
      return [];
    }
  }

  async createJobDescriptionChange(change: InsertJobDescriptionChange): Promise<JobDescriptionChange> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.jobDescriptionChanges).values(change).returning();
    return created;
  }

  // Audit logs
  async getAuditLogs(page: number = 1, limit: number = 50): Promise<{
    logs: AuditLog[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    if (!db) return { logs: [], total: 0, totalPages: 0, currentPage: 1 };
    
    try {
      const offset = (page - 1) * limit;
      const logs = await db
        .select()
        .from(schema.auditLogs)
        .orderBy(desc(schema.auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(schema.auditLogs);

      return {
        logs,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { logs: [], total: 0, totalPages: 0, currentPage: 1 };
    }
  }

  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.auditLogs).values(auditLog).returning();
    return created;
  }

  // Active Directory configuration
  async getActiveDirectoryConfigs(): Promise<ActiveDirectoryConfig[]> {
    if (!db) return [];
    try {
      return await db.select().from(schema.activeDirectoryConfigs);
    } catch (error) {
      console.error('Error fetching AD configs:', error);
      return [];
    }
  }

  async getActiveDirectoryConfig(environment: 'test' | 'live'): Promise<ActiveDirectoryConfig | undefined> {
    if (!db) return undefined;
    try {
      const [config] = await db
        .select()
        .from(schema.activeDirectoryConfigs)
        .where(eq(schema.activeDirectoryConfigs.environment, environment));
      return config;
    } catch (error) {
      console.error('Error fetching AD config:', error);
      return undefined;
    }
  }

  async createActiveDirectoryConfig(config: InsertActiveDirectoryConfig): Promise<ActiveDirectoryConfig> {
    if (!db) throw new Error('Database not available');
    const [created] = await db.insert(schema.activeDirectoryConfigs).values(config).returning();
    return created;
  }

  async updateActiveDirectoryConfig(id: number, config: Partial<InsertActiveDirectoryConfig>): Promise<ActiveDirectoryConfig> {
    if (!db) throw new Error('Database not available');
    const [updated] = await db
      .update(schema.activeDirectoryConfigs)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(schema.activeDirectoryConfigs.id, id))
      .returning();
    return updated;
  }

  async deleteActiveDirectoryConfig(id: number): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.delete(schema.activeDirectoryConfigs).where(eq(schema.activeDirectoryConfigs.id, id));
  }

  // Search functionality
  async searchJobs(query: string, page: number = 1, limit: number = 10): Promise<{
    jobs: Job[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    if (!db) return { jobs: [], total: 0, totalPages: 0, currentPage: 1 };
    
    try {
      const offset = (page - 1) * limit;
      const jobs = await db
        .select()
        .from(schema.jobs)
        .where(ilike(schema.jobs.jobTitle, `%${query}%`))
        .orderBy(desc(schema.jobs.lastUpdated))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(schema.jobs)
        .where(ilike(schema.jobs.jobTitle, `%${query}%`));

      return {
        jobs,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error searching jobs:', error);
      return { jobs: [], total: 0, totalPages: 0, currentPage: 1 };
    }
  }

  // Configuration management
  async getConfiguration(configType: string): Promise<Configuration | undefined> {
    if (!db) return undefined;
    try {
      const [config] = await db.select().from(schema.configurations).where(eq(schema.configurations.configType, configType));
      return config;
    } catch (error) {
      console.error('Error fetching configuration:', error);
      return undefined;
    }
  }

  async createConfiguration(config: InsertConfiguration): Promise<Configuration> {
    if (!db) throw new Error('Database not available');
    try {
      const [newConfig] = await db.insert(schema.configurations).values({
        ...config,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return newConfig;
    } catch (error) {
      console.error('Error creating configuration:', error);
      throw error;
    }
  }

  async updateConfiguration(configType: string, configData: any): Promise<Configuration> {
    if (!db) throw new Error('Database not available');
    try {
      const [updatedConfig] = await db
        .update(schema.configurations)
        .set({ 
          configData,
          updatedAt: new Date()
        })
        .where(eq(schema.configurations.configType, configType))
        .returning();
      
      if (!updatedConfig) {
        // If no config exists, create one
        return this.createConfiguration({ configType, configData });
      }
      
      return updatedConfig;
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw error;
    }
  }
}