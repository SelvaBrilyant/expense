'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Bot,
    Send,
    X,
    Loader2,
    MessageSquare,
    Sparkles,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { AxiosError } from 'axios';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const suggestedQuestions = [
    { icon: TrendingUp, text: 'How much did I spend this month?' },
    { icon: TrendingDown, text: 'Where can I save money?' },
    { icon: PiggyBank, text: 'Am I on track with my budget?' },
    { icon: Target, text: 'Give me savings tips' },
];

export function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = async (messageText?: string) => {
        const text = messageText || input.trim();
        if (!text || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/ai/chat', {
                message: text,
                context: messages.slice(-10), // Send last 10 messages for context
            });

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: axiosError.response?.data?.message || 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'fixed bottom-24 right-6 z-40 h-12 w-12 rounded-full shadow-lg transition-all duration-300',
                    isOpen
                        ? 'bg-gray-500 hover:bg-gray-600'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                )}
            >
                {isOpen ? (
                    <X className="h-5 w-5" />
                ) : (
                    <MessageSquare className="h-5 w-5" />
                )}
            </Button>

            {/* Chat Window */}
            <div
                className={cn(
                    'fixed bottom-40 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] transition-all duration-300 ease-out',
                    isOpen
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                )}
            >
                <Card className="shadow-2xl border-0 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    Financial AI Advisor
                                    <Sparkles className="h-4 w-4" />
                                </h3>
                                <p className="text-xs text-white/80">
                                    Ask me anything about your finances
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <CardContent className="p-0">
                        {/* Messages Area */}
                        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                            {messages.length === 0 ? (
                                <div className="space-y-4">
                                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                                        Hi! I&apos;m your AI financial advisor. Ask me anything about your spending, savings, or budgets!
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {suggestedQuestions.map((q, i) => {
                                            const Icon = q.icon;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSend(q.text)}
                                                    className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800 border hover:border-green-500 hover:shadow-sm transition-all text-left text-xs"
                                                >
                                                    <Icon className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{q.text}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            'flex',
                                            message.role === 'user' ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
                                                message.role === 'user'
                                                    ? 'bg-green-500 text-white rounded-br-sm'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm'
                                            )}
                                        >
                                            {message.role === 'assistant' ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                message.content
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t bg-white dark:bg-gray-900">
                            <div className="flex gap-2">
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about your finances..."
                                    className="flex-1 border-gray-200 dark:border-gray-700"
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    className="bg-green-500 hover:bg-green-600"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
