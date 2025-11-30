'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';

const formSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(6, {
        message: 'Password must be at least 6 characters.',
    }),
});

export default function LoginPage() {
    const router = useRouter();
    const { login, googleLogin, reactivateAccount, isLoading, error } = useAuthStore();
    const [isReactivationNeeded, setIsReactivationNeeded] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isReactivationNeeded) {
            await reactivateAccount(values);
            const state = useAuthStore.getState();
            if (state.user) {
                toast.success('Account reactivated successfully');
                router.push('/dashboard');
            } else if (state.error) {
                toast.error(state.error);
            }
            return;
        }

        await login(values);
        const state = useAuthStore.getState();
        if (state.user) {
            toast.success('Login successful');
            router.push('/dashboard');
        } else if (state.error) {
            if (state.error === "Account deleted. Please reactivate your account.") {
                setIsReactivationNeeded(true);
                toast.error("Your account was deleted. Please reactivate it to continue.");
            } else {
                toast.error(state.error);
            }
        }
    }

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        if (credentialResponse.credential) {
            await googleLogin(credentialResponse.credential);
            const state = useAuthStore.getState();
            if (state.user) {
                toast.success('Login successful');
                router.push('/dashboard');
            } else if (state.error) {
                if (state.error === "Account deleted. Please reactivate your account.") {
                    toast.error("Your account was deleted. Please login with password to reactivate.");
                } else {
                    toast.error(state.error);
                }
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="email@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Processing...' : isReactivationNeeded ? 'Reactivate Account' : 'Login'}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-gray-950 px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error('Google Login Failed')}
                                    theme="filled_blue"
                                    shape="pill"
                                />
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-blue-600 hover:underline">
                            Register
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
