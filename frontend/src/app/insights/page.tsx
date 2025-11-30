'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Send, RefreshCw, TrendingUp, DollarSign, PieChart, CalendarDays, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function InsightsPage() {
    const [insights, setInsights] = useState<string | null>(null);
    const [weeklyReport, setWeeklyReport] = useState<string | null>(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateInsights = async () => {
        setIsLoadingInsights(true);
        try {
            const { data } = await api.post('/ai/insights');
            setInsights(data.insights);
            toast.success('Insights generated!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate insights';
            toast.error(errorMessage);
        } finally {
            setIsLoadingInsights(false);
        }
    };

    const generateWeeklyReport = async () => {
        setIsLoadingReport(true);
        try {
            const { data } = await api.get('/ai/weekly-report');
            setWeeklyReport(data.report);
            toast.success('Weekly report generated!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
            toast.error(errorMessage);
        } finally {
            setIsLoadingReport(false);
        }
    };

    const sendMessage = async (messageText?: string) => {
        const text = messageText || inputMessage.trim();
        if (!text) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsSending(true);

        try {
            const { data } = await api.post('/ai/chat', { message: text });
            const assistantMessage: Message = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
            toast.error(errorMessage);
        } finally {
            setIsSending(false);
        }
    };

    const quickActions = [
        {
            icon: <TrendingUp className="h-4 w-4" />,
            label: 'Analyze spending trends',
            question: 'Can you analyze my spending trends and tell me where I\'m spending the most?'
        },
        {
            icon: <DollarSign className="h-4 w-4" />,
            label: 'Savings advice',
            question: 'How can I save more money based on my spending patterns?'
        },
        {
            icon: <PieChart className="h-4 w-4" />,
            label: 'Budget recommendations',
            question: 'Can you recommend a budget plan based on my income and expenses?'
        },
        {
            icon: <CalendarDays className="h-4 w-4" />,
            label: 'Monthly forecast',
            question: 'What will my expenses look like next month if I continue spending this way?'
        },
    ];

    return (
        <PageLayout title="AI Financial Advisor" description="Get personalized financial insights and advice">
            <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chat">💬 Chat</TabsTrigger>
                    <TabsTrigger value="insights">✨ Insights</TabsTrigger>
                    <TabsTrigger value="reports">📊 Weekly Report</TabsTrigger>
                </TabsList>

                {/* Chat Tab */}
                <TabsContent value="chat" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-500" />
                                Chat with Your Financial Advisor
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Messages */}
                            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                                {messages.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-300" />
                                        <p className="text-lg font-medium mb-2">Ask me anything about your finances!</p>
                                        <p className="text-sm">Try one of the quick actions below to get started</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user'
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-800'
                                                    }`}
                                            >
                                                {msg.role === 'assistant' ? (
                                                    <div className="prose dark:prose-invert prose-sm max-w-none">
                                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p>{msg.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isSending && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Actions */}
                            {messages.length === 0 && (
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {quickActions.map((action, idx) => (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            className="justify-start text-left h-auto py-3"
                                            onClick={() => sendMessage(action.question)}
                                        >
                                            <div className="flex items-start gap-2">
                                                {action.icon}
                                                <span className="text-sm">{action.label}</span>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ask about your spending, budgets, or get financial advice..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    disabled={isSending}
                                />
                                <Button onClick={() => sendMessage()} disabled={isSending || !inputMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Financial Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-6">
                                Get an instant AI-powered analysis of your recent spending patterns, budget adherence,
                                and personalized tips to improve your financial health.
                            </p>
                            <Button
                                onClick={generateInsights}
                                disabled={isLoadingInsights}
                                size="lg"
                            >
                                {isLoadingInsights ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" /> Generate Insights
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {insights && (
                        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                        Your Financial Insights
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" onClick={generateInsights}>
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{insights}</ReactMarkdown>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Weekly Report Tab */}
                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Financial Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-6">
                                Get a comprehensive analysis of your financial activity over the past week including
                                income, expenses, top categories, and actionable recommendations.
                            </p>
                            <Button
                                onClick={generateWeeklyReport}
                                disabled={isLoadingReport}
                                size="lg"
                            >
                                {isLoadingReport ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Report...
                                    </>
                                ) : (
                                    <>
                                        <CalendarDays className="mr-2 h-4 w-4" /> Generate Weekly Report
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {weeklyReport && (
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarDays className="h-5 w-5 text-green-600" />
                                        Weekly Report
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" onClick={generateWeeklyReport}>
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{weeklyReport}</ReactMarkdown>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </PageLayout>
    );
}
