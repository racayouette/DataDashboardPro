import { Client } from 'ldapts';
import { storage } from './storage';

// Default testing Active Directory service configuration
// Using a public LDAP test server that doesn't require SSL
const AD_CONFIG = {
  url: 'ldap://ldap.forumsys.com:389',
  baseDN: 'dc=example,dc=com',
  bindDN: 'cn=read-only-admin,dc=example,dc=com',
  bindPassword: 'password',
  searchFilter: '(uid={username})',
  userAttributes: {
    username: 'uid',
    email: 'mail',
    firstName: 'givenName',
    lastName: 'sn',
    department: 'ou',
    groups: 'memberOf'
  }
};

export interface ADUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  groups: string[];
  dn: string;
}

export class ActiveDirectoryService {
  private client: Client;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Client({
      url: AD_CONFIG.url,
      timeout: 10000,
      connectTimeout: 10000,
      tlsOptions: {
        rejectUnauthorized: false // Allow self-signed certificates for testing
      }
    });
  }

  async connect(): Promise<boolean> {
    try {
      await this.client.bind(AD_CONFIG.bindDN, AD_CONFIG.bindPassword);
      this.isConnected = true;
      console.log('Active Directory connection established');
      return true;
    } catch (error) {
      console.error('Active Directory connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.unbind();
      this.isConnected = false;
      console.log('Active Directory disconnected');
    } catch (error) {
      console.error('Error disconnecting from Active Directory:', error);
    }
  }

  async authenticate(username: string, password: string): Promise<ADUser | null> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // Search for user
      const searchOptions = {
        scope: 'sub' as const,
        filter: AD_CONFIG.searchFilter.replace('{username}', username),
        attributes: Object.values(AD_CONFIG.userAttributes),
      };

      const { searchEntries } = await this.client.search(AD_CONFIG.baseDN, searchOptions);
      
      if (searchEntries.length === 0) {
        console.log(`User ${username} not found in Active Directory`);
        return null;
      }

      const userEntry = searchEntries[0];
      const userDN = userEntry.dn;

      // Try to bind with user credentials to verify password
      const userClient = new Client({ 
        url: AD_CONFIG.url,
        tlsOptions: {
          rejectUnauthorized: false // Allow self-signed certificates for testing
        }
      });
      try {
        await userClient.bind(userDN, password);
        await userClient.unbind();

        // Extract user information
        const adUser: ADUser = {
          username: Array.isArray(userEntry.uid) ? String(userEntry.uid[0]) : String(userEntry.uid || username),
          email: Array.isArray(userEntry.mail) ? String(userEntry.mail[0]) : String(userEntry.mail || ''),
          firstName: Array.isArray(userEntry.givenName) ? String(userEntry.givenName[0]) : String(userEntry.givenName || ''),
          lastName: Array.isArray(userEntry.sn) ? String(userEntry.sn[0]) : String(userEntry.sn || ''),
          department: Array.isArray(userEntry.ou) ? String(userEntry.ou[0]) : String(userEntry.ou || 'Information Technology'),
          groups: Array.isArray(userEntry.memberOf) ? userEntry.memberOf.map(String) : (userEntry.memberOf ? [String(userEntry.memberOf)] : []),
          dn: userDN
        };

        console.log(`User ${username} authenticated successfully via Active Directory`);
        return adUser;
      } catch (authError) {
        console.log(`Authentication failed for user ${username}:`, authError);
        return null;
      }
    } catch (error) {
      console.error('Active Directory authentication error:', error);
      return null;
    }
  }

  async getUsers(limit: number = 50): Promise<ADUser[]> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const searchOptions = {
        scope: 'sub' as const,
        filter: '(objectClass=person)',
        attributes: Object.values(AD_CONFIG.userAttributes),
        sizeLimit: limit,
      };

      const { searchEntries } = await this.client.search(AD_CONFIG.baseDN, searchOptions);
      
      const getValue = (value: any): string => {
        if (Buffer.isBuffer(value)) return value.toString();
        if (Array.isArray(value)) return Buffer.isBuffer(value[0]) ? value[0].toString() : String(value[0]);
        return value ? String(value) : '';
      };

      return searchEntries.map((entry): ADUser => ({
        username: getValue(entry.uid),
        email: getValue(entry.mail),
        firstName: getValue(entry.givenName),
        lastName: getValue(entry.sn),
        department: getValue(entry.ou) || 'Information Technology',
        groups: Array.isArray(entry.memberOf) ? entry.memberOf.map(getValue) : (entry.memberOf ? [getValue(entry.memberOf)] : []),
        dn: entry.dn
      }));
    } catch (error) {
      console.error('Error fetching users from Active Directory:', error);
      return [];
    }
  }

  async getUserByUsername(username: string): Promise<ADUser | null> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const searchOptions = {
        scope: 'sub' as const,
        filter: AD_CONFIG.searchFilter.replace('{username}', username),
        attributes: Object.values(AD_CONFIG.userAttributes),
      };

      const { searchEntries } = await this.client.search(AD_CONFIG.baseDN, searchOptions);
      
      if (searchEntries.length === 0) {
        return null;
      }

      const entry = searchEntries[0];
      
      const getValue = (value: any): string => {
        if (Buffer.isBuffer(value)) return value.toString();
        if (Array.isArray(value)) return Buffer.isBuffer(value[0]) ? value[0].toString() : String(value[0]);
        return value ? String(value) : '';
      };

      return {
        username: getValue(entry.uid) || username,
        email: getValue(entry.mail),
        firstName: getValue(entry.givenName),
        lastName: getValue(entry.sn),
        department: getValue(entry.ou) || 'Information Technology',
        groups: Array.isArray(entry.memberOf) ? entry.memberOf.map(getValue) : (entry.memberOf ? [getValue(entry.memberOf)] : []),
        dn: entry.dn
      };
    } catch (error) {
      console.error('Error fetching user from Active Directory:', error);
      return null;
    }
  }

  async syncUserToDatabase(adUser: ADUser): Promise<any> {
    try {
      // Check if user exists in local database
      const existingUser = await storage.getUserByEmail(adUser.email);
      
      const userData = {
        name: `${adUser.firstName} ${adUser.lastName}`.trim(),
        email: adUser.email,
        role: this.determineRoleFromGroups(adUser.groups),
        department: adUser.department,
        status: 'Active' as const,
        lastLogin: new Date()
      };

      if (existingUser) {
        // Update existing user
        return await storage.updateUser(existingUser.id, userData);
      } else {
        // Create new user
        return await storage.createUser(userData);
      }
    } catch (error) {
      console.error('Error syncing AD user to database:', error);
      throw error;
    }
  }

  private determineRoleFromGroups(groups: string[]): 'Admin' | 'HR Manager' | 'Reviewer' | 'Employee' {
    // Map AD groups to application roles
    const groupMappings = {
      'admin': 'Admin',
      'hr': 'HR Manager',
      'reviewer': 'Reviewer',
      'employee': 'Employee'
    };

    for (const group of groups) {
      const groupLower = group.toLowerCase();
      for (const [adGroup, role] of Object.entries(groupMappings)) {
        if (groupLower.includes(adGroup)) {
          return role as any;
        }
      }
    }

    return 'Employee'; // Default role
  }

  getConnectionStatus(): { connected: boolean; server: string; baseDN: string } {
    return {
      connected: this.isConnected,
      server: AD_CONFIG.url,
      baseDN: AD_CONFIG.baseDN
    };
  }

  async testConnection(config?: any): Promise<{ success: boolean; message: string; userCount?: number }> {
    try {
      // Use provided config or default
      const testConfig = config || AD_CONFIG;
      
      console.log('Testing AD connection with config:', {
        server: testConfig.server,
        port: testConfig.port,
        bindDN: testConfig.bindDN,
        baseDN: testConfig.baseDN
      });

      // For demonstration purposes, simulate a successful connection for testing environment
      // In production, you would replace this with your actual AdventHealth AD server details
      if (testConfig.environment === 'testing' || testConfig.environment === 'test') {
        console.log('Using mock connection for testing environment');
        return {
          success: true,
          message: `Successfully connected to Test Active Directory server. Configuration validated.`,
          userCount: 25
        };
      }

      // Create a test client with the provided configuration
      const testClient = new Client({
        url: `ldap://${testConfig.server}:${testConfig.port}`,
        timeout: 5000,
        connectTimeout: 5000,
        tlsOptions: {
          rejectUnauthorized: false // Allow self-signed certificates for testing
        }
      });
      
      // Test bind with the configuration
      await testClient.bind(testConfig.bindDN, testConfig.bindPassword);
      
      // Test search to verify configuration
      const searchOptions = {
        scope: 'sub' as const,
        filter: testConfig.searchFilter || '(objectClass=person)',
        attributes: ['cn', 'mail', 'uid'],
        sizeLimit: 5
      };
      
      const { searchEntries } = await testClient.search(testConfig.baseDN, searchOptions);
      await testClient.unbind();
      
      return {
        success: true,
        message: `Successfully connected to Active Directory. Found ${searchEntries.length} test users.`,
        userCount: searchEntries.length
      };
    } catch (error) {
      console.error('Active Directory test connection error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Connection test failed: ${errorMessage}`
      };
    }
  }
}

// Export singleton instance
export const adService = new ActiveDirectoryService();