'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';

export default function InsightsPage() {
    const [insights, setInsights] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateInsights = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.post('/ai/insights');
            setInsights(data.insights);
            toast.success('Insights generated!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate insights';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageLayout title="AI Financial Advisor">
            <Card>
                <CardHeader>
                    <CardTitle>Get Personalized Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        Our AI analyzes your spending patterns, recurring payments, and budget
                        habits to give you actionable advice.
                    </p>
                    <Button onClick={generateInsights} disabled={isLoading} size="lg">
                        {isLoading ? (
                            'Analyzing...'
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" /> Generate Insights
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {insights && (
                <Card className="bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-900 shadow-lg">
                    <CardContent className="p-8 prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{insights}</ReactMarkdown>
                    </CardContent>
                </Card>
            )}
        </PageLayout>
    );
}
