'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/login', '/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, checkAuth, isLoading } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            await checkAuth();
            setIsChecking(false);
        };
        initAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isChecking && !isLoading) {
            if (!user && !PUBLIC_ROUTES.includes(pathname)) {
                router.push('/login');
            } else if (user && PUBLIC_ROUTES.includes(pathname)) {
                router.push('/dashboard');
            }
        }
    }, [user, isChecking, isLoading, pathname, router]);

    if (isChecking || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // If on a public route and not logged in, show content
    if (PUBLIC_ROUTES.includes(pathname) && !user) {
        return <>{children}</>;
    }

    // If logged in and on a protected route, show content
    if (user) {
        return <>{children}</>;
    }

    // Otherwise return null while redirecting
    return null;
}
