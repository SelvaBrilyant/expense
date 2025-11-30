'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Lock, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { AxiosError } from 'axios';

function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromQuery = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailFromQuery);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (emailFromQuery) {
            setEmail(emailFromQuery);
        }
    }, [emailFromQuery]);

    const handleVerifyOTP = async () => {
        if (!email || !otp) {
            toast.error('Please enter email and OTP');
            return;
        }

        if (otp.length !== 6) {
            toast.error('OTP must be 6 digits');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/users/verify-reset-otp', { email, otp });
            toast.success('OTP verified successfully!');
            setIsVerified(true);
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error('Please enter both password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/users/reset-password', {
                email,
                otp,
                newPassword,
                confirmPassword,
            });
            toast.success('Password reset successfully!');
            setTimeout(() => {
                router.push('/login');
            }, 1000);
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) {
            toast.error('Email is required');
            return;
        }

        setIsResending(true);

        try {
            await api.post('/users/forgot-password', { email });
            toast.success('New OTP sent to your email!');
            setOtp('');
            setIsVerified(false);
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-purple-950 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <Link href="/forgot-password" className="flex items-center text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 mb-2">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Link>
                    <CardTitle className="text-2xl font-bold">
                        {isVerified ? 'Reset Your Password' : 'Verify OTP'}
                    </CardTitle>
                    <CardDescription>
                        {isVerified
                            ? 'Enter your new password'
                            : 'Enter the 6-digit code sent to your email'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isVerified ? (
                        <div className="space-y-4">
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

                            <div className="space-y-2">
                                <Label htmlFor="otp">OTP Code</Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="pl-10 font-mono text-lg tracking-widest text-center"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    OTP is valid for 10 minutes
                                </p>
                            </div>

                            <Button
                                onClick={handleVerifyOTP}
                                className="w-full"
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </Button>

                            <div className="text-center">
                                <Button
                                    variant="link"
                                    onClick={handleResendOTP}
                                    disabled={isResending}
                                    className="text-sm"
                                >
                                    {isResending ? 'Resending...' : "Didn't receive OTP? Resend"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Resetting Password...' : 'Reset Password'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOTPContent />
        </Suspense>
    );
}
