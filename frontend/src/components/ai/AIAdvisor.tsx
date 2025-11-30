'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
    insights: string;
    isLoading: boolean;
}

export function AIAdvisor({ insights, isLoading }: AIAdvisorProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    🤖 AI Financial Advisor
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : insights ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{insights}</ReactMarkdown>
                    </div>
                ) : (
                    <p className="text-muted-foreground">
                        No insights available. Add some transactions to get personalized advice!
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
