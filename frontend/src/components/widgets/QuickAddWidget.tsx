'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Receipt, MessageSquare, FileText, Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickAction {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
    color: string;
}

const quickActions: QuickAction[] = [
    {
        icon: Receipt,
        label: 'Add Transaction',
        href: '/transactions/add',
        color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
        icon: Repeat2,
        label: 'Recurring',
        href: '/recurring',
        color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
        icon: MessageSquare,
        label: 'AI Chat',
        href: '/insights',
        color: 'bg-green-500 hover:bg-green-600',
    },
    {
        icon: FileText,
        label: 'Reports',
        href: '/reports',
        color: 'bg-orange-500 hover:bg-orange-600',
    },
];

export function QuickAddWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleAction = (href: string) => {
        setIsOpen(false);
        router.push(href);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Quick Action Buttons */}
            <div
                className={cn(
                    'absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300 ease-out',
                    isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                )}
            >
                {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <div
                            key={action.label}
                            className="flex items-center gap-3 justify-end"
                            style={{
                                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                            }}
                        >
                            <span
                                className={cn(
                                    'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg transition-all duration-200',
                                    isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                                )}
                                style={{
                                    transitionDelay: isOpen ? `${index * 50 + 100}ms` : '0ms',
                                }}
                            >
                                {action.label}
                            </span>
                            <Button
                                size="icon"
                                className={cn(
                                    'h-12 w-12 rounded-full shadow-lg transition-all duration-200',
                                    action.color,
                                    isOpen ? 'scale-100' : 'scale-0'
                                )}
                                style={{
                                    transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                                }}
                                onClick={() => handleAction(action.href)}
                            >
                                <Icon className="h-5 w-5 text-white" />
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Main FAB Button */}
            <Button
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'h-14 w-14 rounded-full shadow-xl transition-all duration-300 ease-out',
                    isOpen
                        ? 'bg-red-500 hover:bg-red-600 rotate-45'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rotate-0'
                )}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <Plus className="h-6 w-6 text-white" />
                )}
            </Button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 -z-10"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
