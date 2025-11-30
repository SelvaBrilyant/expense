'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Receipt,
    PiggyBank,
    Repeat,
    Sparkles,
    LogOut,
    Settings,
    ChevronLeft,
    ChevronRight,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    console.log(user);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/transactions', label: 'Transactions', icon: Receipt },
        { href: '/budgets', label: 'Budgets', icon: PiggyBank },
        { href: '/savings', label: 'Savings', icon: Wallet },
        { href: '/recurring', label: 'Recurring', icon: Repeat },
        { href: '/insights', label: 'AI Advisor', icon: Sparkles },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    if (!user) {
        return null;
    }

    return (
        <aside
            className={cn(
                'relative flex flex-col border-r bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out h-screen sticky top-0',
                isCollapsed ? 'w-16' : 'w-64'
            )}
        >
            <div className="flex items-center justify-between p-4 border-b">
                {!isCollapsed && (
                    <Link href="/dashboard" className="text-xl font-bold text-blue-600 truncate">
                        ExpenseAI
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8", isCollapsed ? "mx-auto" : "")}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                                    isCollapsed ? 'justify-center' : ''
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t p-4">
                <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                        {user?.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt={user.name || 'User'}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-sm font-bold text-white">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user?.email || 'email@example.com'}
                            </p>
                        </div>
                    )}
                    {!isCollapsed && (
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </aside>
    );
}
