'use client';

import { usePathname } from 'next/navigation';
import { AIChatWidget } from '@/components/widgets/AIChatWidget';
import { useAuthStore } from '@/store/authStore';

// Pages where widgets should not appear
const excludedPaths = ['/login', '/register', '/forgot-password', '/verify-otp'];

export function WidgetsProvider() {
    const pathname = usePathname();
    const { user } = useAuthStore();

    // Don't show widgets on excluded pages or when not logged in
    if (!user || excludedPaths.some(path => pathname?.startsWith(path))) {
        return null;
    }

    return <AIChatWidget />;
}
