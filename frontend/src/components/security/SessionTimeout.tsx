'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIMEOUT = 28 * 60 * 1000; // 28 minutes (2 minutes before logout)

export function SessionTimeout() {
    const { logout, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningShownRef = useRef(false);

    const handleLogout = useCallback(() => {
        logout();
        router.push('/login');
        toast.error('Session expired due to inactivity');
    }, [logout, router]);

    const showWarning = useCallback(() => {
        if (!warningShownRef.current) {
            warningShownRef.current = true;
            toast.warning('Your session will expire in 2 minutes due to inactivity', {
                duration: 120000, // Show for 2 minutes
            });
        }
    }, []);

    const resetTimer = useCallback(() => {
        warningShownRef.current = false;

        // Clear existing timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

        // Set new timers
        warningTimeoutRef.current = setTimeout(showWarning, WARNING_TIMEOUT);
        timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    }, [handleLogout, showWarning]);

    useEffect(() => {
        // Only run if user is authenticated and not on login/register pages
        const publicPages = ['/login', '/register', '/forgot-password', '/reset-password'];
        if (!user || publicPages.includes(pathname)) {
            return;
        }

        // Events that reset the timer
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
        ];

        // Throttle reset timer to avoid too many calls
        let throttleTimeout: NodeJS.Timeout | null = null;
        const throttledResetTimer = () => {
            if (!throttleTimeout) {
                throttleTimeout = setTimeout(() => {
                    resetTimer();
                    throttleTimeout = null;
                }, 1000); // Throttle to once per second
            }
        };

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, throttledResetTimer);
        });

        // Initial timer setup
        resetTimer();

        // Cleanup
        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, throttledResetTimer);
            });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
            if (throttleTimeout) clearTimeout(throttleTimeout);
        };
    }, [user, pathname, resetTimer]);

    return null; // This is a headless component
}
