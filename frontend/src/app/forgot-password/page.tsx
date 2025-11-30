'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { AxiosError } from 'axios';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/users/forgot-password', { email });
            toast.success('OTP sent! Please check your email');
            // Navigate to verify OTP page with email as query param
            router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-purple-950 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <Link href="/login" className="flex items-center text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 mb-2">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to login
                    </Link>
                    <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
                    <CardDescription>
                        Enter your email address and we&apos;ll send you an OTP to reset your password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Sending OTP...' : 'Send OTP'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
