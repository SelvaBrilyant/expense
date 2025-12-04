'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
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
    Menu,
    X,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
    { href: '/budgets', label: 'Budgets', icon: PiggyBank },
    { href: '/savings', label: 'Savings', icon: Wallet },
    { href: '/recurring', label: 'Recurring', icon: Repeat },
    { href: '/insights', label: 'AI Advisor', icon: Sparkles },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile menu function
    const closeMobileMenu = useCallback(() => {
        setIsMobileOpen(false);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!user) {
        return null;
    }

    const renderNavItems = () => (
        <nav className="space-y-1 px-2">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                            isCollapsed && !isMobileOpen && 'justify-center'
                        )}
                        title={isCollapsed && !isMobileOpen ? item.label : undefined}
                        onClick={() => isMobileOpen && closeMobileMenu()}
                    >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
                    </Link>
                );
            })}
        </nav>
    );

    const renderUserSection = () => (
        <div className={cn("flex items-center gap-3", isCollapsed && !isMobileOpen ? "justify-center" : "")}>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                {user?.profilePicture ? (
                    <Image
                        src={user.profilePicture}
                        alt={user.name || 'User'}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-sm font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                )}
            </div>
            {(!isCollapsed || isMobileOpen) && (
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || 'email@example.com'}
                    </p>
                </div>
            )}
            {(!isCollapsed || isMobileOpen) && (
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                    <LogOut className="h-4 w-4" />
                </Button>
            )}
        </div>
    );

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b px-4 py-3 flex items-center justify-between">
                <Link href="/dashboard" className="text-lg font-bold text-blue-600">
                    EXPENSE AI
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileOpen(true)}
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    'md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out flex flex-col',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <Link href="/dashboard" className="text-xl font-bold text-blue-600 truncate">
                        EXPENSE AI
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={closeMobileMenu}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                    {renderNavItems()}
                </div>

                {/* User Section */}
                <div className="border-t p-4">
                    {renderUserSection()}
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'hidden md:flex flex-col border-r bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out h-screen sticky top-0',
                    isCollapsed ? 'w-16' : 'w-64'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    {!isCollapsed && (
                        <Link href="/dashboard" className="text-xl font-bold text-blue-600 truncate">
                            EXPENSE AI
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

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                    {renderNavItems()}
                </div>

                {/* User Section */}
                <div className="border-t p-4">
                    {renderUserSection()}
                    {/* Logout button for collapsed sidebar */}
                    {isCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-red-600 w-full mt-2"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </aside>
        </>
    );
}
