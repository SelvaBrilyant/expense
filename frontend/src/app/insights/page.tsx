'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function InsightsPage() {
    const [insights, setInsights] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateInsights = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.post('/ai/insights');
            setInsights(data.insights);
            toast.success('Insights generated!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate insights');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen dark:bg-gray-900">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">AI Financial Advisor</h1>
            </div>

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
        </div>
    );
}
