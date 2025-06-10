# Single Sign-On (SSO) Implementation Guide

## Overview

This SSO implementation provides a flexible authentication framework that supports multiple providers:
- **SAML 2.0** - Enterprise identity providers
- **OAuth 2.0** - Social and cloud providers
- **OpenID Connect** - Modern identity standards
- **LDAP** - Directory services

## Quick Start

### 1. Enable SSO
Toggle the SSO switch in the sidebar to enable Single Sign-On functionality.

### 2. Choose Your Provider
Navigate to the SSO configuration page and select your authentication method.

### 3. Install Dependencies
Based on your chosen provider, install the required passport strategy:

```bash
# For SAML
npm install passport-saml

# For OAuth2
npm install passport-oauth2

# For OpenID Connect
npm install passport-openidconnect

# For LDAP
npm install passport-ldapauth
```

## Provider Configuration

### SAML Configuration

#### Required Settings:
- **Entity ID**: Unique identifier for your service provider
- **SSO URL**: Identity provider's single sign-on endpoint
- **X.509 Certificate**: Public certificate from your IdP

#### Environment Variables:
```env
SSO_ENTITY_ID=urn:example:sp
SSO_URL=https://your-idp.com/sso
SSO_X509_CERT=-----BEGIN CERTIFICATE-----...
```

#### Implementation Example:
```typescript
// In server/sso.ts - initializeSAML method
const SamlStrategy = require('passport-saml').Strategy;

passport.use(new SamlStrategy({
  path: '/api/sso/callback',
  entryPoint: process.env.SSO_URL,
  issuer: process.env.SSO_ENTITY_ID,
  cert: process.env.SSO_X509_CERT,
  validateInResponseTo: false,
  disableRequestedAuthnContext: true
}, async (profile, done) => {
  try {
    const user = await ssoService.processUserData(profile);
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));
```

### OAuth 2.0 Configuration

#### Required Settings:
- **Client ID**: OAuth application identifier
- **Client Secret**: OAuth application secret
- **Authorization URL**: Provider's authorization endpoint
- **Token URL**: Provider's token exchange endpoint

#### Environment Variables:
```env
SSO_CLIENT_ID=your-client-id
SSO_CLIENT_SECRET=your-client-secret
SSO_AUTH_URL=https://provider.com/oauth/authorize
SSO_TOKEN_URL=https://provider.com/oauth/token
```

#### Implementation Example:
```typescript
// In server/sso.ts - initializeOAuth2 method
const OAuth2Strategy = require('passport-oauth2');

passport.use(new OAuth2Strategy({
  authorizationURL: process.env.SSO_AUTH_URL,
  tokenURL: process.env.SSO_TOKEN_URL,
  clientID: process.env.SSO_CLIENT_ID,
  clientSecret: process.env.SSO_CLIENT_SECRET,
  callbackURL: '/api/sso/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await ssoService.processUserData(profile);
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));
```

### LDAP Configuration

#### Required Settings:
- **LDAP URL**: Directory server connection string
- **Bind DN**: Service account distinguished name
- **Bind Password**: Service account password
- **Search Base**: Base DN for user searches
- **Search Filter**: LDAP filter template

#### Environment Variables:
```env
LDAP_URL=ldap://your-domain.com:389
LDAP_BIND_DN=CN=binduser,DC=domain,DC=com
LDAP_BIND_PASSWORD=password
LDAP_SEARCH_BASE=DC=domain,DC=com
LDAP_SEARCH_FILTER=(mail={0})
```

#### Implementation Example:
```typescript
// In server/sso.ts - initializeLDAP method
const LdapStrategy = require('passport-ldapauth');

passport.use(new LdapStrategy({
  server: {
    url: process.env.LDAP_URL,
    bindDN: process.env.LDAP_BIND_DN,
    bindCredentials: process.env.LDAP_BIND_PASSWORD,
    searchBase: process.env.LDAP_SEARCH_BASE,
    searchFilter: process.env.LDAP_SEARCH_FILTER
  }
}, async (user, done) => {
  try {
    const processedUser = await ssoService.processUserData(user);
    return done(null, processedUser);
  } catch (error) {
    return done(error);
  }
}));
```

## User Attribute Mapping

Configure how user attributes from your identity provider map to application fields:

```typescript
// Default mapping configuration
userMapping: {
  email: 'email',           // Maps to user email
  firstName: 'firstName',   // Maps to user first name
  lastName: 'lastName',     // Maps to user last name
  department: 'department', // Maps to user department
  role: 'role'             // Maps to user role
}
```

### Custom Mapping Examples:

#### SAML Attributes:
```typescript
userMapping: {
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
  lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
  department: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department',
  role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
}
```

#### Active Directory Attributes:
```typescript
userMapping: {
  email: 'mail',
  firstName: 'givenName',
  lastName: 'sn',
  department: 'department',
  role: 'memberOf'
}
```

## API Endpoints

### Configuration Management

#### Get SSO Configuration
```http
GET /api/sso/config
```

#### Update SSO Configuration
```http
PUT /api/sso/config
Content-Type: application/json

{
  "provider": "saml",
  "settings": {
    "entityId": "urn:example:sp",
    "ssoUrl": "https://your-idp.com/sso"
  }
}
```

#### Toggle SSO Status
```http
POST /api/sso/toggle
Content-Type: application/json

{
  "enabled": true
}
```

### Authentication Flow

#### Initiate SSO Login
```http
GET /api/sso/login
```

#### Handle SSO Callback
```http
POST /api/sso/callback
Content-Type: application/json

{
  "profile": { /* user profile data */ }
}
```

#### SSO Logout
```http
POST /api/sso/logout
```

#### SAML Metadata (SAML only)
```http
GET /api/sso/metadata
```

## Integration Steps

### 1. Backend Integration

1. Install the appropriate passport strategy for your provider
2. Update the strategy initialization methods in `server/sso.ts`
3. Configure environment variables
4. Test the authentication flow

### 2. Frontend Integration

1. Update the login component to check SSO status
2. Redirect users to `/api/sso/login` when SSO is enabled
3. Handle SSO callbacks and user session management

### 3. User Management

The SSO service automatically:
- Creates new users on first login
- Updates existing user information
- Maps provider attributes to application fields
- Maintains user sessions

## Security Considerations

### Certificate Management
- Store certificates securely using environment variables
- Rotate certificates according to your organization's policy
- Validate certificate chains

### Session Security
- Configure secure session cookies
- Implement proper session timeout
- Use HTTPS in production

### Error Handling
- Log authentication failures for security monitoring
- Implement rate limiting for SSO endpoints
- Provide clear error messages without exposing sensitive information

## Testing

### SAML Testing
```bash
# Test SAML metadata endpoint
curl -X GET http://localhost:5000/api/sso/metadata

# Validate SAML configuration
# Use tools like SAML-tracer browser extension
```

### OAuth Testing
```bash
# Test OAuth authorization flow
curl -X GET http://localhost:5000/api/sso/login

# Verify token exchange
curl -X POST http://localhost:5000/api/sso/callback \
  -H "Content-Type: application/json" \
  -d '{"code": "authorization_code"}'
```

### LDAP Testing
```bash
# Test LDAP connectivity
ldapsearch -H ldap://your-domain.com:389 \
  -D "CN=binduser,DC=domain,DC=com" \
  -w password \
  -b "DC=domain,DC=com" \
  "(mail=test@domain.com)"
```

## Troubleshooting

### Common Issues

#### SAML Certificate Errors
- Verify certificate format (PEM)
- Check certificate validity dates
- Ensure proper line endings

#### OAuth Scope Issues
- Verify required scopes are requested
- Check provider documentation for user info access
- Ensure callback URL is registered

#### LDAP Connection Issues
- Test network connectivity to LDAP server
- Verify bind credentials
- Check search base and filter syntax

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=passport:*
```

## Production Deployment

### Environment Setup
1. Configure production environment variables
2. Set up SSL/TLS certificates
3. Configure reverse proxy for SSO endpoints
4. Set up monitoring and logging

### Security Checklist
- [ ] All secrets stored in environment variables
- [ ] HTTPS enabled for all endpoints
- [ ] Session security configured
- [ ] Rate limiting implemented
- [ ] Audit logging enabled
- [ ] Certificate rotation scheduled

## Support

For additional configuration help:
1. Check your identity provider's documentation
2. Review passport strategy documentation
3. Test with provider-specific tools
4. Monitor application logs for detailed error messages

This implementation provides a solid foundation for enterprise SSO integration while maintaining flexibility for custom requirements.