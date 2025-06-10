import { Client } from 'ldapts';
import { storage } from './storage';

// Free testing Active Directory service configuration
// Using demo.freeipa.org - a free FreeIPA testing instance
const AD_CONFIG = {
  url: 'ldaps://ipa.demo1.freeipa.org',
  baseDN: 'cn=users,cn=accounts,dc=demo1,dc=freeipa,dc=org',
  bindDN: 'uid=admin,cn=users,cn=accounts,dc=demo1,dc=freeipa,dc=org',
  bindPassword: 'Secret123', // Demo password for testing
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
      const userClient = new Client({ url: AD_CONFIG.url });
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
      
      return searchEntries.map((entry): ADUser => ({
        username: Array.isArray(entry.uid) ? entry.uid[0] : entry.uid || '',
        email: Array.isArray(entry.mail) ? entry.mail[0] : entry.mail || '',
        firstName: Array.isArray(entry.givenName) ? entry.givenName[0] : entry.givenName || '',
        lastName: Array.isArray(entry.sn) ? entry.sn[0] : entry.sn || '',
        department: Array.isArray(entry.ou) ? entry.ou[0] : entry.ou || 'Information Technology',
        groups: Array.isArray(entry.memberOf) ? entry.memberOf : (entry.memberOf ? [entry.memberOf] : []),
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
      return {
        username: Array.isArray(entry.uid) ? entry.uid[0] : entry.uid || username,
        email: Array.isArray(entry.mail) ? entry.mail[0] : entry.mail || '',
        firstName: Array.isArray(entry.givenName) ? entry.givenName[0] : entry.givenName || '',
        lastName: Array.isArray(entry.sn) ? entry.sn[0] : entry.sn || '',
        department: Array.isArray(entry.ou) ? entry.ou[0] : entry.ou || 'Information Technology',
        groups: Array.isArray(entry.memberOf) ? entry.memberOf : (entry.memberOf ? [entry.memberOf] : []),
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

  async testConnection(): Promise<{ success: boolean; message: string; userCount?: number }> {
    try {
      const connected = await this.connect();
      if (!connected) {
        return { success: false, message: 'Failed to connect to Active Directory server' };
      }

      // Test by fetching a small number of users
      const users = await this.getUsers(5);
      await this.disconnect();

      return {
        success: true,
        message: `Successfully connected to Active Directory. Found ${users.length} test users.`,
        userCount: users.length
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error}`
      };
    }
  }
}

// Export singleton instance
export const adService = new ActiveDirectoryService();