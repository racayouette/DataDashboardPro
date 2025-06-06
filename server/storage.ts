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
  InsertAuditLog
} from "@shared/schema";

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
  
  // Authentication
  getReviewerByUsername(username: string): Promise<Reviewer | undefined>;
  createUserInReviewers(userData: { username: string, fullName: string, email: string }): Promise<Reviewer>;
  
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
  private usersList: Map<number, User>;
  private jobsList: Map<number, Job>;
  private jobDescriptionsList: Map<number, JobDescription>;
  private essentialFunctionsList: Map<number, EssentialFunction>;
  private notificationsList: Map<number, Notification>;
  private jobDescriptionChangesList: Map<number, JobDescriptionChange>;
  private auditLogsList: Map<number, AuditLog>;
  
  private currentSummaryId: number;
  private currentTransactionId: number;
  private currentJobFamilyId: number;
  private currentReviewerId: number;
  private currentUserId: number;
  private currentJobId: number;
  private currentJobDescriptionId: number;
  private currentEssentialFunctionId: number;
  private currentNotificationId: number;
  private currentJobDescriptionChangeId: number;
  private currentAuditLogId: number;

  constructor() {
    this.dashboardSummaries = new Map();
    this.transactionsList = new Map();
    this.jobFamiliesList = new Map();
    this.reviewersList = new Map();
    this.usersList = new Map();
    this.jobsList = new Map();
    this.jobDescriptionsList = new Map();
    this.essentialFunctionsList = new Map();
    this.notificationsList = new Map();
    this.jobDescriptionChangesList = new Map();
    this.auditLogsList = new Map();
    
    this.currentSummaryId = 1;
    this.currentTransactionId = 1;
    this.currentJobFamilyId = 1;
    this.currentReviewerId = 1;
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentJobDescriptionId = 1;
    this.currentEssentialFunctionId = 1;
    this.currentNotificationId = 1;
    this.currentJobDescriptionChangeId = 1;
    this.currentAuditLogId = 1;

    this.initializeData();
  }

  private initializeData() {
    const now = new Date();
    
    // Create dashboard summary
    const summary: DashboardSummary = {
      id: this.currentSummaryId++,
      totalUsers: 9000,
      revenue: "712",
      orders: 132,
      growthRate: "56",
      jobsReviewed: 145,
      inProgress: 85,
      notStarted: 40,
      updatedAt: now,
    };
    this.dashboardSummaries.set(summary.id, summary);

    // Create transactions
    const sampleTransactions: Omit<Transaction, 'id'>[] = [
      {
        customerName: "Sarah Miller",
        customerEmail: "sarah@example.com",
        amount: "2450.00",
        status: "Completed",
        description: "Job description review for Clinical Support",
        date: new Date("2024-03-15"),
      },
      {
        customerName: "John Davis",
        customerEmail: "john@example.com",
        amount: "1250.00",
        status: "Pending",
        description: "IT Services job family assessment",
        date: new Date("2024-03-14"),
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
        description: "Healthcare and clinical support roles",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Revenue Cycle",
        totalJobs: 95,
        jobsReviewed: 60,
        description: "Revenue cycle and billing positions",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Finance",
        totalJobs: 120,
        jobsReviewed: 85,
        description: "Financial management and accounting positions",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Human Resources",
        totalJobs: 78,
        jobsReviewed: 52,
        description: "HR and talent management roles",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "IT Services",
        totalJobs: 145,
        jobsReviewed: 98,
        description: "IT and technology support positions",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Pharmacy",
        totalJobs: 45,
        jobsReviewed: 38,
        description: "Pharmacy and pharmaceutical roles",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Lab Services",
        totalJobs: 62,
        jobsReviewed: 48,
        description: "Laboratory and diagnostic services",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Behavioral Health",
        totalJobs: 38,
        jobsReviewed: 25,
        description: "Mental health and behavioral services",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Security",
        totalJobs: 25,
        jobsReviewed: 20,
        description: "Security and safety positions",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Quality",
        totalJobs: 42,
        jobsReviewed: 35,
        description: "Quality assurance and control roles",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Nutrition",
        totalJobs: 28,
        jobsReviewed: 22,
        description: "Nutrition and dietary services",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Facilities",
        totalJobs: 55,
        jobsReviewed: 42,
        description: "Facilities and maintenance roles",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Patient Access",
        totalJobs: 35,
        jobsReviewed: 28,
        description: "Patient registration and access services",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Health Information",
        totalJobs: 30,
        jobsReviewed: 24,
        description: "Health information management",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Spiritual Care",
        totalJobs: 15,
        jobsReviewed: 12,
        description: "Chaplaincy and spiritual services",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Patient Support",
        totalJobs: 22,
        jobsReviewed: 18,
        description: "Patient transport and support services",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Leadership",
        totalJobs: 18,
        jobsReviewed: 15,
        description: "Executive and management positions",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Legal",
        totalJobs: 12,
        jobsReviewed: 10,
        description: "Legal and compliance roles",
        createdAt: now,
        updatedAt: now,
      },
    ];

    sampleJobFamilies.forEach(jobFamily => {
      const fullJobFamily: JobFamily = {
        ...jobFamily,
        id: this.currentJobFamilyId++,
      };
      this.jobFamiliesList.set(fullJobFamily.id, fullJobFamily);
    });

    // Create reviewers with authentication fields
    const sampleReviewers: Omit<Reviewer, 'id'>[] = [
      {
        username: null,
        fullName: null,
        email: null,
        jobFamily: "Sarah Mitchell",
        completed: 82,
        inProgress: 5,
        responsible: "James Patterson",
        createdAt: now,
        updatedAt: now,
      },
      {
        username: null,
        fullName: null,
        email: null,
        jobFamily: "Kelly Johnson",
        completed: 67,
        inProgress: 12,
        responsible: "Maria Rodriguez",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Robert Kennedy",
        completed: 45,
        inProgress: 8,
        responsible: "Jennifer Smith",
        username: null,
        fullName: null,
        email: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Adam Lambert",
        completed: 73,
        inProgress: 6,
        responsible: "Michael Brown",
        username: null,
        fullName: null,
        email: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Jennifer Williams",
        completed: 91,
        inProgress: 3,
        responsible: "Lisa Anderson",
        username: null,
        fullName: null,
        email: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Michael Roberts",
        completed: 38,
        inProgress: 15,
        responsible: "Thomas Garcia",
        username: null,
        fullName: null,
        email: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Linda Taylor",
        completed: 56,
        inProgress: 9,
        responsible: "David Thompson",
        username: null,
        fullName: null,
        email: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "David Phillips",
        completed: 42,
        inProgress: 7,
        responsible: "Susan Davis",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Emma Sullivan",
        completed: 59,
        inProgress: 11,
        responsible: "Patricia Miller",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Chris Harrison",
        completed: 74,
        inProgress: 4,
        responsible: "Kevin Garcia",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Robert Taylor",
        completed: 63,
        inProgress: 8,
        responsible: "Carlos Martinez",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Amanda Wilson",
        completed: 48,
        inProgress: 13,
        responsible: "Amanda Wilson",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Nicole Taylor",
        completed: 35,
        inProgress: 6,
        responsible: "Nicole Taylor",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Thomas Anderson",
        completed: 52,
        inProgress: 10,
        responsible: "Linda Johnson",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Brian Wilson",
        completed: 67,
        inProgress: 5,
        responsible: "Brian Wilson",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Angela Martinez",
        completed: 41,
        inProgress: 14,
        responsible: "Angela Martinez",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Christine Lee",
        completed: 58,
        inProgress: 7,
        responsible: "Christine Lee",
        createdAt: now,
        updatedAt: now,
      },
      {
        jobFamily: "Daniel Garcia",
        completed: 46,
        inProgress: 9,
        responsible: "Daniel Garcia",
        createdAt: now,
        updatedAt: now,
      },
    ];

    sampleReviewers.forEach(reviewer => {
      const fullReviewer: Reviewer = {
        ...reviewer,
        id: this.currentReviewerId++,
      };
      this.reviewersList.set(fullReviewer.id, fullReviewer);
    });

    // Create sample users
    const sampleUsers: Omit<User, 'id'>[] = [
      {
        email: "sarah.mitchell@company.com",
        name: "Sarah Mitchell",
        role: "admin",
        department: "Human Resources",
        status: "Active",
        lastLogin: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        email: "john.doe@company.com",
        name: "John Doe",
        role: "reviewer",
        department: "Clinical Operations",
        status: "Active",
        lastLogin: now,
        createdAt: now,
        updatedAt: now,
      },
    ];

    sampleUsers.forEach(user => {
      const fullUser: User = {
        ...user,
        id: this.currentUserId++,
      };
      this.usersList.set(fullUser.id, fullUser);
    });
  }

  // Dashboard and summary data
  async getDashboardSummary(): Promise<DashboardSummary | undefined> {
    return Array.from(this.dashboardSummaries.values())[0];
  }

  async getRecentTransactions(page: number = 1, limit: number = 4): Promise<{ transactions: Transaction[], total: number, totalPages: number, currentPage: number }> {
    const allTransactions = Array.from(this.transactionsList.values());
    const total = allTransactions.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const transactions = allTransactions.slice(startIndex, startIndex + limit);
    
    return { transactions, total, totalPages, currentPage: page };
  }

  async getJobFamilies(page: number = 1, limit: number = 4): Promise<{ jobFamilies: JobFamily[], total: number, totalPages: number, currentPage: number }> {
    const allJobFamilies = Array.from(this.jobFamiliesList.values());
    const total = allJobFamilies.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const jobFamilies = allJobFamilies.slice(startIndex, startIndex + limit);
    
    return { jobFamilies, total, totalPages, currentPage: page };
  }

  async getReviewers(page: number = 1, limit: number = 4): Promise<{ reviewers: Reviewer[], total: number, totalPages: number, currentPage: number }> {
    const allReviewers = Array.from(this.reviewersList.values());
    const total = allReviewers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const reviewers = allReviewers.slice(startIndex, startIndex + limit);
    
    return { reviewers, total, totalPages, currentPage: page };
  }

  async createDashboardSummary(summary: InsertDashboardSummary): Promise<DashboardSummary> {
    const newSummary: DashboardSummary = {
      ...summary,
      id: this.currentSummaryId++,
      updatedAt: new Date(),
    };
    this.dashboardSummaries.set(newSummary.id, newSummary);
    return newSummary;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      description: transaction.description ?? null,
      id: this.currentTransactionId++,
      date: new Date(),
    };
    this.transactionsList.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  async createJobFamily(jobFamily: InsertJobFamily): Promise<JobFamily> {
    const now = new Date();
    const newJobFamily: JobFamily = {
      ...jobFamily,
      description: jobFamily.description ?? null,
      id: this.currentJobFamilyId++,
      createdAt: now,
      updatedAt: now,
    };
    this.jobFamiliesList.set(newJobFamily.id, newJobFamily);
    return newJobFamily;
  }

  async createReviewer(reviewer: InsertReviewer): Promise<Reviewer> {
    const now = new Date();
    const newReviewer: Reviewer = {
      ...reviewer,
      username: reviewer.username ?? null,
      fullName: reviewer.fullName ?? null,
      email: reviewer.email ?? null,
      id: this.currentReviewerId++,
      createdAt: now,
      updatedAt: now,
    };
    this.reviewersList.set(newReviewer.id, newReviewer);
    return newReviewer;
  }

  // User management
  async getUsers(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number, totalPages: number, currentPage: number }> {
    const allUsers = Array.from(this.usersList.values());
    const total = allUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const users = allUsers.slice(startIndex, startIndex + limit);
    
    return { users, total, totalPages, currentPage: page };
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.usersList.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersList.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const now = new Date();
    const newUser: User = {
      ...user,
      lastLogin: user.lastLogin ?? null,
      id: this.currentUserId++,
      createdAt: now,
      updatedAt: now,
    };
    this.usersList.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const existingUser = this.usersList.get(id);
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...user,
      updatedAt: new Date(),
    };
    this.usersList.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.usersList.delete(id);
  }

  // Job management
  async getJobs(page: number = 1, limit: number = 10, filters?: { reviewer?: string, status?: string }): Promise<{ jobs: Job[], total: number, totalPages: number, currentPage: number }> {
    let allJobs = Array.from(this.jobsList.values());
    
    if (filters?.status) {
      allJobs = allJobs.filter(job => job.status === filters.status);
    }
    
    const total = allJobs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const jobs = allJobs.slice(startIndex, startIndex + limit);
    
    return { jobs, total, totalPages, currentPage: page };
  }

  async getJobById(id: number): Promise<Job | undefined> {
    return this.jobsList.get(id);
  }

  async getJobByCode(code: string): Promise<Job | undefined> {
    return Array.from(this.jobsList.values()).find(job => job.jobCode === code);
  }

  async createJob(job: InsertJob): Promise<Job> {
    const now = new Date();
    const newJob: Job = {
      ...job,
      jobFamilyId: job.jobFamilyId ?? null,
      reviewerId: job.reviewerId ?? null,
      responsibleId: job.responsibleId ?? null,
      lastUpdated: job.lastUpdated ?? now,
      id: this.currentJobId++,
      createdAt: now,
      updatedAt: now,
    };
    this.jobsList.set(newJob.id, newJob);
    return newJob;
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job> {
    const existingJob = this.jobsList.get(id);
    if (!existingJob) {
      throw new Error(`Job with id ${id} not found`);
    }
    
    const updatedJob: Job = {
      ...existingJob,
      ...job,
      updatedAt: new Date(),
    };
    this.jobsList.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: number): Promise<void> {
    this.jobsList.delete(id);
  }

  // Job descriptions
  async getJobDescriptions(jobId: number): Promise<JobDescription[]> {
    return Array.from(this.jobDescriptionsList.values()).filter(jd => jd.jobId === jobId);
  }

  async getJobDescriptionById(id: number): Promise<JobDescription | undefined> {
    return this.jobDescriptionsList.get(id);
  }

  async getActiveJobDescription(jobId: number): Promise<JobDescription | undefined> {
    return Array.from(this.jobDescriptionsList.values()).find(jd => jd.jobId === jobId && jd.isActive);
  }

  async createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription> {
    const now = new Date();
    const newJobDescription: JobDescription = {
      ...jobDescription,
      jobId: jobDescription.jobId ?? null,
      version: jobDescription.version ?? 1,
      originalJobSummary: jobDescription.originalJobSummary ?? null,
      lastEditedById: jobDescription.lastEditedById ?? null,
      lastUpdatedDate: jobDescription.lastUpdatedDate ?? now,
      isActive: jobDescription.isActive ?? null,
      id: this.currentJobDescriptionId++,
      createdAt: now,
      updatedAt: now,
    };
    this.jobDescriptionsList.set(newJobDescription.id, newJobDescription);
    return newJobDescription;
  }

  async updateJobDescription(id: number, jobDescription: Partial<InsertJobDescription>): Promise<JobDescription> {
    const existing = this.jobDescriptionsList.get(id);
    if (!existing) {
      throw new Error(`Job description with id ${id} not found`);
    }
    
    const updated: JobDescription = {
      ...existing,
      ...jobDescription,
      updatedAt: new Date(),
    };
    this.jobDescriptionsList.set(id, updated);
    return updated;
  }

  // Essential functions
  async getEssentialFunctions(jobDescriptionId: number): Promise<EssentialFunction[]> {
    return Array.from(this.essentialFunctionsList.values())
      .filter(ef => ef.jobDescriptionId === jobDescriptionId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createEssentialFunction(essentialFunction: InsertEssentialFunction): Promise<EssentialFunction> {
    const now = new Date();
    const newFunction: EssentialFunction = {
      ...essentialFunction,
      jobDescriptionId: essentialFunction.jobDescriptionId ?? null,
      hasEdit: essentialFunction.hasEdit ?? null,
      id: this.currentEssentialFunctionId++,
      createdAt: now,
      updatedAt: now,
    };
    this.essentialFunctionsList.set(newFunction.id, newFunction);
    return newFunction;
  }

  async updateEssentialFunction(id: number, essentialFunction: Partial<InsertEssentialFunction>): Promise<EssentialFunction> {
    const existing = this.essentialFunctionsList.get(id);
    if (!existing) {
      throw new Error(`Essential function with id ${id} not found`);
    }
    
    const updated: EssentialFunction = {
      ...existing,
      ...essentialFunction,
      updatedAt: new Date(),
    };
    this.essentialFunctionsList.set(id, updated);
    return updated;
  }

  async deleteEssentialFunction(id: number): Promise<void> {
    this.essentialFunctionsList.delete(id);
  }

  async reorderEssentialFunctions(jobDescriptionId: number, functionIds: number[]): Promise<void> {
    functionIds.forEach((id, index) => {
      const func = this.essentialFunctionsList.get(id);
      if (func && func.jobDescriptionId === jobDescriptionId) {
        func.sortOrder = index + 1;
        func.updatedAt = new Date();
        this.essentialFunctionsList.set(id, func);
      }
    });
  }

  // Notifications
  async getNotifications(userId?: number, page: number = 1, limit: number = 10): Promise<{ notifications: Notification[], total: number, totalPages: number, currentPage: number }> {
    let allNotifications = Array.from(this.notificationsList.values());
    
    if (userId) {
      allNotifications = allNotifications.filter(n => n.userId === userId);
    }
    
    const total = allNotifications.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const notifications = allNotifications.slice(startIndex, startIndex + limit);
    
    return { notifications, total, totalPages, currentPage: page };
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const now = new Date();
    const newNotification: Notification = {
      ...notification,
      userId: notification.userId ?? null,
      isRead: notification.isRead ?? null,
      id: this.currentNotificationId++,
      createdAt: now,
      updatedAt: now,
    };
    this.notificationsList.set(newNotification.id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notificationsList.get(id);
    if (notification) {
      notification.isRead = true;
      notification.updatedAt = new Date();
      this.notificationsList.set(id, notification);
    }
  }

  async deleteNotification(id: number): Promise<void> {
    this.notificationsList.delete(id);
  }

  // Track changes
  async getJobDescriptionChanges(jobDescriptionId: number): Promise<JobDescriptionChange[]> {
    return Array.from(this.jobDescriptionChangesList.values())
      .filter(change => change.jobDescriptionId === jobDescriptionId);
  }

  async createJobDescriptionChange(change: InsertJobDescriptionChange): Promise<JobDescriptionChange> {
    const now = new Date();
    const newChange: JobDescriptionChange = {
      ...change,
      jobDescriptionId: change.jobDescriptionId ?? null,
      userId: change.userId ?? null,
      oldValue: change.oldValue ?? null,
      newValue: change.newValue ?? null,
      position: change.position ?? null,
      id: this.currentJobDescriptionChangeId++,
      createdAt: now,
    };
    this.jobDescriptionChangesList.set(newChange.id, newChange);
    return newChange;
  }

  // Audit log
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const now = new Date();
    const newLog: AuditLog = {
      ...log,
      userId: log.userId ?? null,
      entityId: log.entityId ?? null,
      ipAddress: log.ipAddress ?? null,
      userAgent: log.userAgent ?? null,
      details: log.details ?? {},
      id: this.currentAuditLogId++,
      createdAt: now,
    };
    this.auditLogsList.set(newLog.id, newLog);
    return newLog;
  }

  async getAuditLogs(page: number = 1, limit: number = 10): Promise<{ logs: AuditLog[], total: number, totalPages: number, currentPage: number }> {
    const allLogs = Array.from(this.auditLogsList.values());
    const total = allLogs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const logs = allLogs.slice(startIndex, startIndex + limit);
    
    return { logs, total, totalPages, currentPage: page };
  }

  async getReviewerByUsername(username: string): Promise<Reviewer | undefined> {
    const reviewers = Array.from(this.reviewersList.values());
    return reviewers.find(reviewer => reviewer.username === username);
  }

  async createUserInReviewers(userData: { username: string, fullName: string, email: string }): Promise<Reviewer> {
    const id = ++this.currentReviewerId;
    const now = new Date();
    const newReviewer: Reviewer = {
      id,
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      jobFamily: "General",
      completed: 0,
      inProgress: 0,
      responsible: userData.fullName,
      createdAt: now,
      updatedAt: now,
    };
    this.reviewersList.set(id, newReviewer);
    return newReviewer;
  }
}

export const storage = new MemStorage();