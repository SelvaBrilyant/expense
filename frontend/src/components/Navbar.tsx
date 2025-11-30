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
} from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    if (pathname === '/login' || pathname === '/register') {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/transactions', label: 'Transactions', icon: Receipt },
        { href: '/budgets', label: 'Budgets', icon: PiggyBank },
        { href: '/recurring', label: 'Recurring', icon: Repeat },
        { href: '/insights', label: 'AI Advisor', icon: Sparkles },
    ];

    return (
        <nav className="border-b bg-white dark:bg-gray-900 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                    ExpenseAI
                </Link>
                <div className="hidden md:flex gap-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                    {user?.name}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </nav>
    );
}
