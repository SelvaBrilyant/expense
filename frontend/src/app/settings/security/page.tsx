'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Shield,
    Smartphone,
    Monitor,
    Laptop,
    LogOut,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    MapPin,
    AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Event type display configuration
const eventTypeConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    LOGIN_SUCCESS: { label: 'Login', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    LOGIN_FAILED: { label: 'Failed Login', color: 'bg-red-100 text-red-800', icon: XCircle },
    LOGOUT: { label: 'Logout', color: 'bg-gray-100 text-gray-800', icon: LogOut },
    PASSWORD_CHANGE: { label: 'Password Changed', color: 'bg-blue-100 text-blue-800', icon: Shield },
    PASSWORD_RESET_REQUEST: { label: 'Password Reset Request', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
    PASSWORD_RESET_SUCCESS: { label: 'Password Reset', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    ACCOUNT_LOCKED: { label: 'Account Locked', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    ACCOUNT_UNLOCKED: { label: 'Account Unlocked', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    TOKEN_REFRESH: { label: 'Token Refresh', color: 'bg-gray-100 text-gray-800', icon: RefreshCw },
    TOKEN_REVOKED: { label: 'Session Revoked', color: 'bg-orange-100 text-orange-800', icon: XCircle },
    ACCOUNT_DELETED: { label: 'Account Deleted', color: 'bg-red-100 text-red-800', icon: XCircle },
    ACCOUNT_REACTIVATED: { label: 'Account Reactivated', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    PROFILE_UPDATED: { label: 'Profile Updated', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
};

// Parse user agent to get device info
const parseUserAgent = (userAgent: string): { device: string; browser: string; icon: typeof Smartphone } => {
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const isTablet = /Tablet|iPad/i.test(userAgent);

    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    return {
        device: `${os}`,
        browser,
        icon: isMobile ? Smartphone : isTablet ? Laptop : Monitor,
    };
};

export default function SecurityPage() {
    const { sessions, securityLogs, fetchSessions, fetchSecurityLogs, revokeSession, logoutAllDevices } = useAuthStore();
    const [revoking, setRevoking] = useState<string | null>(null);

    useEffect(() => {
        fetchSessions();
        fetchSecurityLogs();
    }, [fetchSessions, fetchSecurityLogs]);

    const handleRevokeSession = async (sessionId: string) => {
        setRevoking(sessionId);
        try {
            await revokeSession(sessionId);
            toast.success('Session revoked successfully');
        } catch {
            toast.error('Failed to revoke session');
        } finally {
            setRevoking(null);
        }
    };

    const handleLogoutAllDevices = async () => {
        try {
            await logoutAllDevices();
            toast.success('Logged out from all devices');
        } catch {
            toast.error('Failed to logout from all devices');
        }
    };

    return (
        <PageLayout
            title="Security"
            description="Manage your account security, active sessions, and view security activity"
        >
            <Tabs defaultValue="sessions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="sessions" className="gap-2">
                        <Smartphone className="h-4 w-4" />
                        Active Sessions
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="gap-2">
                        <Shield className="h-4 w-4" />
                        Security Logs
                    </TabsTrigger>
                </TabsList>

                {/* Active Sessions Tab */}
                <TabsContent value="sessions" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Active Sessions</CardTitle>
                                <CardDescription>
                                    Devices that are currently logged into your account
                                </CardDescription>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout All Devices
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Logout from all devices?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will log you out from all devices including this one. You will need to login again.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleLogoutAllDevices}>
                                            Logout All
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardHeader>
                        <CardContent>
                            {sessions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No active sessions found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sessions.map((session) => {
                                        const { device, browser, icon: DeviceIcon } = parseUserAgent(session.userAgent || '');
                                        const isCurrentSession = session.id === sessions[0]?.id; // Assuming first is current

                                        return (
                                            <div
                                                key={session.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-primary/10 rounded-full">
                                                        <DeviceIcon className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium">{device} • {browser}</p>
                                                            {isCurrentSession && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Current
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {session.ipAddress || 'Unknown IP'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                Active {formatDistanceToNow(new Date(session.createdAt))} ago
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {!isCurrentSession && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRevokeSession(session.id)}
                                                        disabled={revoking === session.id}
                                                    >
                                                        {revoking === session.id ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4" />
                                                        )}
                                                        <span className="ml-2">Revoke</span>
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Logs Tab */}
                <TabsContent value="logs" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Security Activity</CardTitle>
                                <CardDescription>
                                    Recent security events on your account
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => fetchSecurityLogs()}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {securityLogs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No security events found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {securityLogs.map((log) => {
                                        const config = eventTypeConfig[log.eventType] || {
                                            label: log.eventType,
                                            color: 'bg-gray-100 text-gray-800',
                                            icon: Shield,
                                        };
                                        const EventIcon = config.icon;

                                        return (
                                            <div
                                                key={log.id}
                                                className="flex items-start gap-4 p-3 border rounded-lg"
                                            >
                                                <div className={`p-2 rounded-full ${log.success ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    <EventIcon className={`h-4 w-4 ${log.success ? 'text-green-600' : 'text-red-600'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge className={config.color} variant="secondary">
                                                            {config.label}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(log.createdAt))} ago
                                                        </span>
                                                    </div>
                                                    {log.details && (
                                                        <p className="text-sm text-muted-foreground mt-1 truncate">
                                                            {log.details}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        IP: {log.ipAddress || 'Unknown'}
                                                    </p>
                                                </div>
                                                {!log.success && (
                                                    <Badge variant="destructive" className="shrink-0">
                                                        Failed
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </PageLayout>
    );
}
