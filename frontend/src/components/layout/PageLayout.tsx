import React, { ReactNode } from 'react';

interface PageLayoutProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}

export function PageLayout({ title, description, action, children }: PageLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
                {children}
            </div>
        </div>
    );
}
