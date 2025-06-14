import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, Wifi, WifiOff, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface DatabaseHealthStatus {
  isConnected: boolean;
  lastConnected: string | null;
  lastError: string | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  uptime: number;
  timestamp: string;
}

interface HealthMetrics {
  responseTime: number;
  connectionUptime: number;
  errorCount: number;
  successfulQueries: number;
}

export function DatabaseHealthMonitor() {
  const [healthStatus, setHealthStatus] = useState<DatabaseHealthStatus | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics>({
    responseTime: 0,
    connectionUptime: 0,
    errorCount: 0,
    successfulQueries: 0
  });
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected for health monitoring');
        setIsWebSocketConnected(true);
        
        // Request initial status
        wsRef.current?.send(JSON.stringify({ type: 'request_status' }));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'health_status') {
            const status = message.data as DatabaseHealthStatus;
            setHealthStatus(status);
            setLastUpdate(new Date().toLocaleTimeString());
            
            // Update metrics based on status
            setMetrics(prev => ({
              ...prev,
              connectionUptime: status.uptime,
              errorCount: status.lastError ? prev.errorCount + 1 : prev.errorCount,
              successfulQueries: status.isConnected ? prev.successfulQueries + 1 : prev.successfulQueries
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsWebSocketConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsWebSocketConnected(false);
      };
      
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      setIsWebSocketConnected(false);
    }
  };

  useEffect(() => {
    connectWebSocket();
    
    // Cleanup on component unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const getStatusColor = (isConnected: boolean, hasError: boolean) => {
    if (isConnected) return 'text-green-600';
    if (hasError) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (isConnected: boolean, hasError: boolean) => {
    if (isConnected) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (hasError) return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getConnectionProgress = () => {
    if (!healthStatus) return 0;
    if (healthStatus.isConnected) return 100;
    return Math.max(0, 100 - (healthStatus.reconnectAttempts / healthStatus.maxReconnectAttempts) * 100);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          Database Health Monitor
          {isWebSocketConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {healthStatus ? (
          <>
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(healthStatus.isConnected, !!healthStatus.lastError)}
                <span className={`font-medium ${getStatusColor(healthStatus.isConnected, !!healthStatus.lastError)}`}>
                  {healthStatus.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <Badge variant={healthStatus.isConnected ? 'default' : 'destructive'}>
                SQL Server
              </Badge>
            </div>

            {/* Connection Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Connection Health</span>
                <span>{Math.round(getConnectionProgress())}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getConnectionProgress()}%` }}
                />
              </div>
            </div>

            <Separator />

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Uptime</div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-sm font-mono">
                    {healthStatus.uptime > 0 ? formatUptime(healthStatus.uptime) : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Reconnect Attempts</div>
                <div className="text-sm font-mono">
                  {healthStatus.reconnectAttempts}/{healthStatus.maxReconnectAttempts}
                </div>
              </div>
            </div>

            {/* Last Connected */}
            {healthStatus.lastConnected && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Last Connected</div>
                <div className="text-sm font-mono">
                  {new Date(healthStatus.lastConnected).toLocaleString()}
                </div>
              </div>
            )}

            {/* Error Information */}
            {healthStatus.lastError && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground text-red-600">Last Error</div>
                <div className="text-xs font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                  {healthStatus.lastError}
                </div>
              </div>
            )}

            {/* Real-time Status */}
            <Separator />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Last Update: {lastUpdate}</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span>Real-time {isWebSocketConnected ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Connecting to database health monitor...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}