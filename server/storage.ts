import { 
  dashboardSummary, 
  transactions, 
  jobFamilies,
  reviewers,
  type DashboardSummary,
  type Transaction,
  type JobFamily,
  type Reviewer,
  type InsertDashboardSummary,
  type InsertTransaction,
  type InsertJobFamily,
  type InsertReviewer
} from "@shared/schema";

export interface IStorage {
  getDashboardSummary(): Promise<DashboardSummary | undefined>;
  getRecentTransactions(page?: number, limit?: number): Promise<{ transactions: Transaction[], total: number, totalPages: number, currentPage: number }>;
  getJobFamilies(page?: number, limit?: number): Promise<{ jobFamilies: JobFamily[], total: number, totalPages: number, currentPage: number }>;
  getReviewers(page?: number, limit?: number): Promise<{ reviewers: Reviewer[], total: number, totalPages: number, currentPage: number }>;
  createDashboardSummary(summary: InsertDashboardSummary): Promise<DashboardSummary>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createJobFamily(jobFamily: InsertJobFamily): Promise<JobFamily>;
  createReviewer(reviewer: InsertReviewer): Promise<Reviewer>;
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

export const storage = new MemStorage();
