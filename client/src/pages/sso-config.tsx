import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, Settings, Code, Globe } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SSOConfig {
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

export default function SSOConfigPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<SSOConfig | null>(null);

  // Fetch SSO configuration
  const { data: ssoConfig, isLoading } = useQuery({
    queryKey: ['/api/sso/config'],
    retry: false,
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<SSOConfig>) => {
      const response = await fetch('/api/sso/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "SSO configuration has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sso/config'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update SSO configuration.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (ssoConfig) {
      setConfig(ssoConfig);
    }
  }, [ssoConfig]);

  const handleConfigUpdate = (field: string, value: any) => {
    if (!config) return;
    
    const keys = field.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setConfig(newConfig);
  };

  const handleSaveConfig = () => {
    if (config) {
      updateConfigMutation.mutate(config);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading SSO Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Single Sign-On Configuration</h1>
          </div>
          <p className="text-gray-600">
            Configure SSO authentication for your organization. Choose from SAML, OAuth2, OpenID Connect, or LDAP providers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>SSO Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure your Single Sign-On provider settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={config.provider} onValueChange={(value) => handleConfigUpdate('provider', value)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="saml">SAML</TabsTrigger>
                    <TabsTrigger value="oauth2">OAuth2</TabsTrigger>
                    <TabsTrigger value="oidc">OpenID</TabsTrigger>
                    <TabsTrigger value="ldap">LDAP</TabsTrigger>
                  </TabsList>

                  <TabsContent value="saml" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entityId">Entity ID</Label>
                        <Input
                          id="entityId"
                          value={config.settings.entityId || ''}
                          onChange={(e) => handleConfigUpdate('settings.entityId', e.target.value)}
                          placeholder="urn:example:sp"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ssoUrl">SSO URL</Label>
                        <Input
                          id="ssoUrl"
                          value={config.settings.ssoUrl || ''}
                          onChange={(e) => handleConfigUpdate('settings.ssoUrl', e.target.value)}
                          placeholder="https://your-idp.com/sso"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="x509cert">X.509 Certificate</Label>
                      <Textarea
                        id="x509cert"
                        value={config.settings.x509cert || ''}
                        onChange={(e) => handleConfigUpdate('settings.x509cert', e.target.value)}
                        placeholder="-----BEGIN CERTIFICATE-----"
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="oauth2" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientId">Client ID</Label>
                        <Input
                          id="clientId"
                          value={config.settings.clientId || ''}
                          onChange={(e) => handleConfigUpdate('settings.clientId', e.target.value)}
                          placeholder="your-client-id"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientSecret">Client Secret</Label>
                        <Input
                          id="clientSecret"
                          type="password"
                          value={config.settings.clientSecret || ''}
                          onChange={(e) => handleConfigUpdate('settings.clientSecret', e.target.value)}
                          placeholder="your-client-secret"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="authUrl">Authorization URL</Label>
                        <Input
                          id="authUrl"
                          value={config.settings.authorizationUrl || ''}
                          onChange={(e) => handleConfigUpdate('settings.authorizationUrl', e.target.value)}
                          placeholder="https://provider.com/oauth/authorize"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tokenUrl">Token URL</Label>
                        <Input
                          id="tokenUrl"
                          value={config.settings.tokenUrl || ''}
                          onChange={(e) => handleConfigUpdate('settings.tokenUrl', e.target.value)}
                          placeholder="https://provider.com/oauth/token"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="oidc" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="oidcClientId">Client ID</Label>
                        <Input
                          id="oidcClientId"
                          value={config.settings.clientId || ''}
                          onChange={(e) => handleConfigUpdate('settings.clientId', e.target.value)}
                          placeholder="your-oidc-client-id"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userInfoUrl">User Info URL</Label>
                        <Input
                          id="userInfoUrl"
                          value={config.settings.userInfoUrl || ''}
                          onChange={(e) => handleConfigUpdate('settings.userInfoUrl', e.target.value)}
                          placeholder="https://provider.com/userinfo"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ldap" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ldapUrl">LDAP URL</Label>
                        <Input
                          id="ldapUrl"
                          value={config.settings.ldapUrl || ''}
                          onChange={(e) => handleConfigUpdate('settings.ldapUrl', e.target.value)}
                          placeholder="ldap://your-domain.com:389"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bindDN">Bind DN</Label>
                        <Input
                          id="bindDN"
                          value={config.settings.bindDN || ''}
                          onChange={(e) => handleConfigUpdate('settings.bindDN', e.target.value)}
                          placeholder="CN=binduser,DC=domain,DC=com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="searchBase">Search Base</Label>
                        <Input
                          id="searchBase"
                          value={config.settings.searchBase || ''}
                          onChange={(e) => handleConfigUpdate('settings.searchBase', e.target.value)}
                          placeholder="DC=domain,DC=com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="searchFilter">Search Filter</Label>
                        <Input
                          id="searchFilter"
                          value={config.settings.searchFilter || ''}
                          onChange={(e) => handleConfigUpdate('settings.searchFilter', e.target.value)}
                          placeholder="(mail={0})"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">User Attribute Mapping</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emailMapping">Email Attribute</Label>
                      <Input
                        id="emailMapping"
                        value={config.userMapping.email}
                        onChange={(e) => handleConfigUpdate('userMapping.email', e.target.value)}
                        placeholder="email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstNameMapping">First Name Attribute</Label>
                      <Input
                        id="firstNameMapping"
                        value={config.userMapping.firstName}
                        onChange={(e) => handleConfigUpdate('userMapping.firstName', e.target.value)}
                        placeholder="firstName"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastNameMapping">Last Name Attribute</Label>
                      <Input
                        id="lastNameMapping"
                        value={config.userMapping.lastName}
                        onChange={(e) => handleConfigUpdate('userMapping.lastName', e.target.value)}
                        placeholder="lastName"
                      />
                    </div>
                    <div>
                      <Label htmlFor="departmentMapping">Department Attribute</Label>
                      <Input
                        id="departmentMapping"
                        value={config.userMapping.department}
                        onChange={(e) => handleConfigUpdate('userMapping.department', e.target.value)}
                        placeholder="department"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setConfig(ssoConfig as SSOConfig)}>
                    Reset
                  </Button>
                  <Button onClick={handleSaveConfig} disabled={updateConfigMutation.isPending}>
                    {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status and Documentation Panel */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {config.enabled ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  )}
                  <span>SSO Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${config.enabled ? 'text-green-600' : 'text-orange-600'}`}>
                      {config.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Provider:</span>
                    <span className="text-sm font-medium uppercase">{config.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Login URL:</span>
                    <span className="text-sm font-mono text-blue-600">{config.endpoints.login}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Developer Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>Developer Guide</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Required Dependencies</AlertTitle>
                  <AlertDescription className="text-xs">
                    Install the appropriate passport strategy:
                    <br />
                    • SAML: npm install passport-saml
                    <br />
                    • OAuth2: npm install passport-oauth2
                    <br />
                    • LDAP: npm install passport-ldapauth
                  </AlertDescription>
                </Alert>

                <div className="text-sm space-y-2">
                  <h4 className="font-medium">Implementation Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                    <li>Install required passport strategy</li>
                    <li>Configure provider settings above</li>
                    <li>Update server/sso.ts with strategy setup</li>
                    <li>Test authentication flow</li>
                    <li>Configure user attribute mapping</li>
                  </ol>
                </div>

                <div className="text-sm space-y-2">
                  <h4 className="font-medium">Available Endpoints:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• GET /api/sso/login - Initiate SSO</li>
                    <li>• POST /api/sso/callback - Handle response</li>
                    <li>• POST /api/sso/logout - SSO logout</li>
                    <li>• GET /api/sso/metadata - SAML metadata</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Environment Variables</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1 font-mono text-gray-600">
                  <div>SSO_ENTITY_ID</div>
                  <div>SSO_URL</div>
                  <div>SSO_X509_CERT</div>
                  <div>SSO_CLIENT_ID</div>
                  <div>SSO_CLIENT_SECRET</div>
                  <div>LDAP_URL</div>
                  <div>LDAP_BIND_DN</div>
                  <div>LDAP_BIND_PASSWORD</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}