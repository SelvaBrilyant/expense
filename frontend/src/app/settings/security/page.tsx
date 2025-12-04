'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

// Event type display configuration
const eventTypeConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    LOGIN_SUCCESS: { label: 'Login', variant: 'default' },
    LOGIN_FAILED: { label: 'Failed Login', variant: 'destructive' },
    LOGOUT: { label: 'Logout', variant: 'secondary' },
    PASSWORD_CHANGE: { label: 'Password Changed', variant: 'default' },
    PASSWORD_RESET_REQUEST: { label: 'Password Reset Request', variant: 'outline' },
    PASSWORD_RESET_SUCCESS: { label: 'Password Reset', variant: 'default' },
    ACCOUNT_LOCKED: { label: 'Account Locked', variant: 'destructive' },
    ACCOUNT_UNLOCKED: { label: 'Account Unlocked', variant: 'default' },
    TOKEN_REFRESH: { label: 'Token Refresh', variant: 'secondary' },
    TOKEN_REVOKED: { label: 'Session Revoked', variant: 'destructive' },
    ACCOUNT_DELETED: { label: 'Account Deleted', variant: 'destructive' },
    ACCOUNT_REACTIVATED: { label: 'Account Reactivated', variant: 'default' },
    PROFILE_UPDATED: { label: 'Profile Updated', variant: 'default' },
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
    const [activeTab, setActiveTab] = useState<'sessions' | 'logs'>('sessions');

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
            description="Manage sessions and view activity"
            action={
                <Link href="/settings">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Settings
                    </Button>
                </Link>
            }
        >
            <div className="space-y-6">
                {/* Simple Tab Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === 'sessions' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveTab('sessions')}
                    >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Sessions
                    </Button>
                    <Button
                        variant={activeTab === 'logs' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveTab('logs')}
                    >
                        <Shield className="h-4 w-4 mr-2" />
                        Activity
                    </Button>
                </div>

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                            <div>
                                <CardTitle className="text-lg">Active Sessions</CardTitle>
                                <CardDescription>
                                    Devices logged into your account
                                </CardDescription>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout All
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Logout from all devices?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will log you out from all devices including this one.
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
                                    <Smartphone className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                    <p className="text-sm">No active sessions</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sessions.map((session, index) => {
                                        const { device, browser, icon: DeviceIcon } = parseUserAgent(session.userAgent || '');
                                        const isCurrentSession = index === 0;

                                        return (
                                            <div
                                                key={session.id}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-muted rounded-lg">
                                                        <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium">{device} • {browser}</p>
                                                            {isCurrentSession && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Current
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {session.ipAddress || 'Unknown'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDistanceToNow(new Date(session.createdAt))} ago
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
                                                        className="text-muted-foreground hover:text-destructive"
                                                    >
                                                        {revoking === session.id ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Security Logs Tab */}
                {activeTab === 'logs' && (
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                            <div>
                                <CardTitle className="text-lg">Security Activity</CardTitle>
                                <CardDescription>
                                    Recent events on your account
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
                                    <Shield className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                    <p className="text-sm">No activity found</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {securityLogs.map((log) => {
                                        const config = eventTypeConfig[log.eventType] || {
                                            label: log.eventType,
                                            variant: 'secondary' as const,
                                        };

                                        return (
                                            <div
                                                key={log.id}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-full ${log.success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                                        {log.success ? (
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                        ) : (
                                                            <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge variant={config.variant} className="text-xs">
                                                                {config.label}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(new Date(log.createdAt))} ago
                                                            </span>
                                                        </div>
                                                        {log.details && (
                                                            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
                                                                {log.details}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground hidden sm:block">
                                                    {log.ipAddress || 'Unknown IP'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageLayout>
    );
}
