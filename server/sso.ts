import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { storage } from './storage';

// SSO Configuration Interface
export interface SSOConfig {
  enabled: boolean;
  provider: 'saml' | 'oauth2' | 'oidc' | 'ldap';
  endpoints: {
    login: string;
    callback: string;
    logout: string;
    metadata?: string;
  };
  settings: {
    entityId?: string;
    ssoUrl?: string;
    x509cert?: string;
    clientId?: string;
    clientSecret?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    ldapUrl?: string;
    bindDN?: string;
    bindPassword?: string;
    searchBase?: string;
    searchFilter?: string;
  };
  userMapping: {
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    role: string;
  };
}

// Default SSO Configuration
const defaultSSOConfig: SSOConfig = {
  enabled: false,
  provider: 'saml',
  endpoints: {
    login: '/api/sso/login',
    callback: '/api/sso/callback',
    logout: '/api/sso/logout',
    metadata: '/api/sso/metadata'
  },
  settings: {
    entityId: process.env.SSO_ENTITY_ID || 'urn:example:sp',
    ssoUrl: process.env.SSO_URL || '',
    x509cert: process.env.SSO_X509_CERT || '',
    clientId: process.env.SSO_CLIENT_ID || '',
    clientSecret: process.env.SSO_CLIENT_SECRET || '',
    authorizationUrl: process.env.SSO_AUTH_URL || '',
    tokenUrl: process.env.SSO_TOKEN_URL || '',
    userInfoUrl: process.env.SSO_USER_INFO_URL || '',
    ldapUrl: process.env.LDAP_URL || '',
    bindDN: process.env.LDAP_BIND_DN || '',
    bindPassword: process.env.LDAP_BIND_PASSWORD || '',
    searchBase: process.env.LDAP_SEARCH_BASE || '',
    searchFilter: process.env.LDAP_SEARCH_FILTER || '(mail={0})'
  },
  userMapping: {
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    department: 'department',
    role: 'role'
  }
};

// SSO Service Class
export class SSOService {
  private config: SSOConfig;
  private isEnabled: boolean = false;

  constructor(config: SSOConfig = defaultSSOConfig) {
    this.config = config;
    this.isEnabled = config.enabled;
  }

  // Enable/Disable SSO
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.config.enabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  // Get SSO Configuration
  public getConfig(): SSOConfig {
    return this.config;
  }

  // Update SSO Configuration
  public updateConfig(newConfig: Partial<SSOConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Initialize SSO Provider (SAML Example)
  public async initializeSAML(): Promise<any> {
    if (!this.isEnabled) return null;

    try {
      // Placeholder for SAML2 strategy initialization
      // Developers should install: npm install passport-saml
      // const SamlStrategy = require('passport-saml').Strategy;
      
      const samlOptions = {
        path: this.config.endpoints.callback,
        entryPoint: this.config.settings.ssoUrl,
        issuer: this.config.settings.entityId,
        cert: this.config.settings.x509cert,
        validateInResponseTo: false,
        disableRequestedAuthnContext: true
      };

      console.log('SAML SSO Configuration:', samlOptions);
      return samlOptions;
    } catch (error) {
      console.error('SAML SSO initialization failed:', error);
      throw error;
    }
  }

  // Initialize OAuth2 Provider
  public async initializeOAuth2(): Promise<any> {
    if (!this.isEnabled) return null;

    try {
      // Placeholder for OAuth2 strategy initialization
      // Developers should install: npm install passport-oauth2
      
      const oauth2Options = {
        authorizationURL: this.config.settings.authorizationUrl,
        tokenURL: this.config.settings.tokenUrl,
        clientID: this.config.settings.clientId,
        clientSecret: this.config.settings.clientSecret,
        callbackURL: this.config.endpoints.callback
      };

      console.log('OAuth2 SSO Configuration:', oauth2Options);
      return oauth2Options;
    } catch (error) {
      console.error('OAuth2 SSO initialization failed:', error);
      throw error;
    }
  }

  // Initialize LDAP Authentication
  public async initializeLDAP(): Promise<any> {
    if (!this.isEnabled) return null;

    try {
      // Placeholder for LDAP strategy initialization
      // Developers should install: npm install passport-ldapauth
      
      const ldapOptions = {
        server: {
          url: this.config.settings.ldapUrl,
          bindDN: this.config.settings.bindDN,
          bindCredentials: this.config.settings.bindPassword,
          searchBase: this.config.settings.searchBase,
          searchFilter: this.config.settings.searchFilter
        }
      };

      console.log('LDAP SSO Configuration:', ldapOptions);
      return ldapOptions;
    } catch (error) {
      console.error('LDAP SSO initialization failed:', error);
      throw error;
    }
  }

  // Process SSO User Data
  public async processUserData(profile: any): Promise<any> {
    try {
      const userData = {
        email: profile[this.config.userMapping.email] || profile.email,
        firstName: profile[this.config.userMapping.firstName] || profile.firstName,
        lastName: profile[this.config.userMapping.lastName] || profile.lastName,
        department: profile[this.config.userMapping.department] || profile.department || 'Information Technology',
        role: profile[this.config.userMapping.role] || profile.role || 'Employee'
      };

      // Create or update user in storage
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return await storage.updateUser(existingUser.id, userData);
      } else {
        return await storage.createUser({
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          role: userData.role as any,
          department: userData.department,
          status: 'Active',
          lastLogin: new Date()
        });
      }
    } catch (error) {
      console.error('SSO user processing failed:', error);
      throw error;
    }
  }
}

// Initialize SSO Service
export const ssoService = new SSOService();

// SSO Middleware
export const ssoMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!ssoService.getEnabled()) {
    return res.status(403).json({ 
      error: 'SSO is not enabled',
      message: 'Single Sign-On functionality is currently disabled'
    });
  }
  next();
};

// SSO Routes Setup
export function setupSSORoutes(app: express.Application): void {
  // Enable/Disable SSO endpoint
  app.post('/api/sso/toggle', async (req: Request, res: Response) => {
    try {
      const { enabled } = req.body;
      ssoService.setEnabled(enabled);
      
      res.json({ 
        success: true, 
        enabled: ssoService.getEnabled(),
        message: `SSO ${enabled ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to toggle SSO', details: error });
    }
  });

  // Get SSO Configuration
  app.get('/api/sso/config', (req: Request, res: Response) => {
    try {
      const config = ssoService.getConfig();
      // Remove sensitive data from response
      const safeConfig = {
        ...config,
        settings: {
          ...config.settings,
          clientSecret: config.settings.clientSecret ? '***' : '',
          bindPassword: config.settings.bindPassword ? '***' : '',
          x509cert: config.settings.x509cert ? '***' : ''
        }
      };
      res.json(safeConfig);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get SSO configuration' });
    }
  });

  // Update SSO Configuration
  app.put('/api/sso/config', async (req: Request, res: Response) => {
    try {
      const newConfig = req.body;
      ssoService.updateConfig(newConfig);
      res.json({ success: true, message: 'SSO configuration updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update SSO configuration' });
    }
  });

  // SSO Login Endpoint
  app.get('/api/sso/login', ssoMiddleware, async (req: Request, res: Response) => {
    try {
      const config = ssoService.getConfig();
      
      switch (config.provider) {
        case 'saml':
          const samlConfig = await ssoService.initializeSAML();
          res.json({ 
            provider: 'saml',
            redirectUrl: samlConfig?.entryPoint || config.settings.ssoUrl,
            message: 'Redirect to SAML IdP'
          });
          break;
          
        case 'oauth2':
          const oauth2Config = await ssoService.initializeOAuth2();
          res.json({ 
            provider: 'oauth2',
            redirectUrl: oauth2Config?.authorizationURL,
            message: 'Redirect to OAuth2 provider'
          });
          break;
          
        case 'ldap':
          res.json({ 
            provider: 'ldap',
            message: 'LDAP authentication ready',
            loginForm: true
          });
          break;
          
        default:
          res.status(400).json({ error: 'Unsupported SSO provider' });
      }
    } catch (error) {
      res.status(500).json({ error: 'SSO login failed', details: error });
    }
  });

  // SSO Callback Endpoint
  app.post('/api/sso/callback', ssoMiddleware, async (req: Request, res: Response) => {
    try {
      const { profile, samlResponse, code, username, password } = req.body;
      
      let userData;
      const config = ssoService.getConfig();
      
      switch (config.provider) {
        case 'saml':
          // Process SAML response
          userData = await ssoService.processUserData(profile || samlResponse);
          break;
          
        case 'oauth2':
          // Process OAuth2 code exchange
          userData = await ssoService.processUserData(profile);
          break;
          
        case 'ldap':
          // Process LDAP authentication
          if (username && password) {
            // Placeholder for LDAP authentication
            userData = await ssoService.processUserData({ email: username });
          }
          break;
          
        default:
          throw new Error('Unsupported SSO provider');
      }
      
      res.json({ 
        success: true, 
        user: userData,
        message: 'SSO authentication successful'
      });
    } catch (error) {
      res.status(401).json({ error: 'SSO authentication failed', details: error });
    }
  });

  // SSO Logout Endpoint
  app.post('/api/sso/logout', ssoMiddleware, (req: Request, res: Response) => {
    try {
      const config = ssoService.getConfig();
      
      // Clear session data
      if ((req as any).session) {
        (req as any).session.destroy((err: any) => {
          if (err) {
            console.error('Session destruction error:', err);
          }
        });
      }
      
      res.json({ 
        success: true,
        logoutUrl: config.settings.ssoUrl ? `${config.settings.ssoUrl}/logout` : null,
        message: 'SSO logout successful'
      });
    } catch (error) {
      res.status(500).json({ error: 'SSO logout failed' });
    }
  });

  // SSO Metadata Endpoint (for SAML)
  app.get('/api/sso/metadata', ssoMiddleware, (req: Request, res: Response) => {
    try {
      const config = ssoService.getConfig();
      
      if (config.provider !== 'saml') {
        return res.status(400).json({ error: 'Metadata only available for SAML provider' });
      }
      
      const metadata = `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${config.settings.entityId}">
  <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${req.protocol}://${req.get('host')}${config.endpoints.callback}" index="1"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
      
      res.set('Content-Type', 'application/xml');
      res.send(metadata);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate metadata' });
    }
  });
}

// Export default configuration for developers
export { defaultSSOConfig };