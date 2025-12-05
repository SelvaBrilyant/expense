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

// AI Assistant Name
const AI_NAME = 'Finley';

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
                    'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-105',
                    isOpen
                        ? 'bg-muted hover:bg-muted/80'
                        : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
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
                    'fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] transition-all duration-300 ease-out',
                    isOpen
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                )}
            >
                <Card className="shadow-2xl border border-border/50 overflow-hidden backdrop-blur-sm">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                                <Bot className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                                    {AI_NAME}
                                    <Sparkles className="h-4 w-4 text-purple-200" />
                                </h3>
                                <p className="text-sm text-white/80">
                                    Your Personal Finance Assistant
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 h-9 w-9"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <CardContent className="p-0">
                        {/* Messages Area */}
                        <div className="h-[420px] overflow-y-auto px-5 py-6 space-y-6 bg-background/50">
                            {messages.length === 0 ? (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2 px-4">
                                        <p className="text-muted-foreground text-base leading-relaxed">
                                            👋 Hi! I&apos;m <span className="font-semibold text-primary">{AI_NAME}</span>, your personal finance assistant.
                                        </p>
                                        <p className="text-muted-foreground/80 text-sm">
                                            Ask me anything about your spending, savings, or budgets!
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        {suggestedQuestions.map((q, i) => {
                                            const Icon = q.icon;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSend(q.text)}
                                                    className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-md hover:bg-accent/50 transition-all text-left text-sm group"
                                                >
                                                    <Icon className="h-5 w-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                                                    <span className="text-foreground/80 leading-snug">{q.text}</span>
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
                                            'flex gap-3',
                                            message.role === 'user' ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        {/* AI Avatar */}
                                        {message.role === 'assistant' && (
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center mt-1">
                                                <Bot className="h-4 w-4 text-white" />
                                            </div>
                                        )}

                                        <div
                                            className={cn(
                                                'rounded-2xl',
                                                message.role === 'user'
                                                    ? 'max-w-[75%] bg-gradient-to-r from-purple-600 to-violet-600 text-white px-5 py-3.5 rounded-br-md shadow-md'
                                                    : 'max-w-[85%] bg-card border border-border/50 text-foreground rounded-bl-md shadow-sm'
                                            )}
                                        >
                                            {message.role === 'assistant' ? (
                                                <div className="px-5 py-4">
                                                    {/* AI Name Label */}
                                                    <p className="text-xs font-semibold text-primary mb-3">{AI_NAME}</p>

                                                    {/* Message Content with Enhanced Typography */}
                                                    <div className="
                                                        prose prose-sm dark:prose-invert max-w-none
                                                        prose-p:my-3 prose-p:leading-[1.75] prose-p:text-[0.9375rem]
                                                        prose-headings:mt-5 prose-headings:mb-3 prose-headings:font-semibold
                                                        prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                                                        prose-ul:my-3 prose-ul:pl-4
                                                        prose-ol:my-3 prose-ol:pl-4
                                                        prose-li:my-2 prose-li:leading-relaxed
                                                        prose-strong:text-primary prose-strong:font-semibold
                                                        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                                                        prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg
                                                        prose-blockquote:border-l-primary prose-blockquote:pl-4 prose-blockquote:italic
                                                        [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                                                        space-y-3
                                                    ">
                                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="leading-relaxed text-[0.9375rem]">{message.content}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div className="flex justify-start gap-3">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
                                        <p className="text-xs font-semibold text-primary mb-3">{AI_NAME}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Thinking</span>
                                            <div className="flex gap-1">
                                                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-border/50 bg-card">
                            <div className="flex gap-3">
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={`Ask ${AI_NAME} anything...`}
                                    className="flex-1 border-border/50 bg-background focus-visible:ring-primary/50 h-11"
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-md h-11 w-11"
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
