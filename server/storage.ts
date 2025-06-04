import { 
  dashboardSummary, 
  transactions, 
  products,
  type DashboardSummary,
  type Transaction,
  type Product,
  type InsertDashboardSummary,
  type InsertTransaction,
  type InsertProduct
} from "@shared/schema";

export interface IStorage {
  getDashboardSummary(): Promise<DashboardSummary | undefined>;
  getRecentTransactions(limit?: number): Promise<Transaction[]>;
  getTopProducts(limit?: number): Promise<Product[]>;
  createDashboardSummary(summary: InsertDashboardSummary): Promise<DashboardSummary>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class MemStorage implements IStorage {
  private dashboardSummaries: Map<number, DashboardSummary>;
  private transactionsList: Map<number, Transaction>;
  private productsList: Map<number, Product>;
  private currentSummaryId: number;
  private currentTransactionId: number;
  private currentProductId: number;

  constructor() {
    this.dashboardSummaries = new Map();
    this.transactionsList = new Map();
    this.productsList = new Map();
    this.currentSummaryId = 1;
    this.currentTransactionId = 1;
    this.currentProductId = 1;

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
        name: "MacBook Pro",
        category: "Electronics",
        sales: 847,
        revenue: "42350.00",
        trend: "+15%",
      },
      {
        name: "iPhone 15",
        category: "Mobile",
        sales: 1245,
        revenue: "98760.00",
        trend: "+22%",
      },
      {
        name: "AirPods Pro",
        category: "Audio",
        sales: 623,
        revenue: "15575.00",
        trend: "-5%",
      },
      {
        name: "iPad Air",
        category: "Tablets",
        sales: 412,
        revenue: "28840.00",
        trend: "+8%",
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

  async getRecentTransactions(limit: number = 4): Promise<Transaction[]> {
    const allTransactions = Array.from(this.transactionsList.values());
    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getTopProducts(limit: number = 4): Promise<Product[]> {
    const allProducts = Array.from(this.productsList.values());
    return allProducts
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
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
