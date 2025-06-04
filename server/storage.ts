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
      totalUsers: 24531,
      revenue: "127450.00",
      orders: 1847,
      growthRate: "18.70",
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

    // Create products
    const sampleProducts: Omit<Product, 'id'>[] = [
      {
        name: "iPhone 15",
        category: "Mobile",
        sales: 1245,
        revenue: "98760.00",
        trend: "+22%",
      },
      {
        name: "MacBook Pro",
        category: "Electronics",
        sales: 847,
        revenue: "42350.00",
        trend: "+15%",
      },
      {
        name: "iPad Air",
        category: "Tablets",
        sales: 623,
        revenue: "28840.00",
        trend: "+8%",
      },
      {
        name: "AirPods Pro",
        category: "Audio",
        sales: 412,
        revenue: "15575.00",
        trend: "-5%",
      },
      {
        name: "Apple Watch",
        category: "Wearables",
        sales: 756,
        revenue: "32890.00",
        trend: "+18%",
      },
      {
        name: "iMac",
        category: "Electronics",
        sales: 298,
        revenue: "47680.00",
        trend: "+12%",
      },
      {
        name: "MacBook Air",
        category: "Electronics",
        sales: 534,
        revenue: "58740.00",
        trend: "+25%",
      },
      {
        name: "iPhone 14",
        category: "Mobile",
        sales: 892,
        revenue: "71360.00",
        trend: "-8%",
      },
      {
        name: "AirPods Max",
        category: "Audio",
        sales: 187,
        revenue: "10230.00",
        trend: "+5%",
      },
      {
        name: "Mac Studio",
        category: "Electronics",
        sales: 156,
        revenue: "31200.00",
        trend: "+32%",
      },
      {
        name: "iPad Pro",
        category: "Tablets",
        sales: 445,
        revenue: "48950.00",
        trend: "+14%",
      },
      {
        name: "Apple TV",
        category: "Entertainment",
        sales: 234,
        revenue: "34560.00",
        trend: "-3%",
      },
    ];

    sampleProducts.forEach(product => {
      const fullProduct: Product = {
        ...product,
        id: this.currentProductId++,
      };
      this.productsList.set(fullProduct.id, fullProduct);
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

  async getTopProducts(page: number = 1, limit: number = 4): Promise<{ products: Product[], total: number, totalPages: number, currentPage: number }> {
    const allProducts = Array.from(this.productsList.values());
    const sortedProducts = allProducts
      .sort((a, b) => b.sales - a.sales);
    
    const total = sortedProducts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const products = sortedProducts.slice(startIndex, endIndex);

    return {
      products,
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

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.productsList.set(id, product);
    return product;
  }
}

export const storage = new MemStorage();
