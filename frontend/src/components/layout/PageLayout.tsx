import React, { ReactNode } from 'react';

interface PageLayoutProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}

export function PageLayout({ title, description, action, children }: PageLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6 lg:p-8 pt-16 md:pt-4">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Header Section - Stack on mobile, side-by-side on larger screens */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm sm:text-base text-muted-foreground mt-1 line-clamp-2">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && (
                        <div className="flex-shrink-0 w-full sm:w-auto">
                            {action}
                        </div>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}
