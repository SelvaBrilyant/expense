'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2, Shield, User, Mail, Phone, Calendar, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { PageLayout } from '@/components/layout/PageLayout';
import { ImageUpload } from '@/components/image-upload';
import api from '@/lib/api';
import { motion } from 'framer-motion';

function SettingsContent() {
    const { user, updateProfile, isLoading } = useAuthStore();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        phoneNumber: user?.phoneNumber || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        profilePicture: user?.profilePicture || '',
        coverPicture: user?.coverPicture || '',
    });

    // Track if we've done the initial load to prevent confetti on refresh
    const isInitialLoadRef = useRef(true);
    const hasShownConfettiRef = useRef(false);

    // Calculate profile completion
    const fields = ['name', 'email', 'bio', 'phoneNumber', 'dateOfBirth', 'profilePicture', 'coverPicture'];
    const filledFields = fields.filter(field => formData[field as keyof typeof formData]);
    const completion = Math.round((filledFields.length / fields.length) * 100);

    const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        try {
            const formDataObj = new FormData();
            formDataObj.append('image', file);

            const { data } = await api.post('/upload', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const updatedData = {
                ...formData,
                [type === 'profile' ? 'profilePicture' : 'coverPicture']: data.url
            };

            setFormData(updatedData);

            // Automatically update the profile in the database
            await updateProfile(updatedData);

            toast.success(`${type === 'profile' ? 'Profile' : 'Cover'} photo updated successfully`);
        } catch {
            toast.error('Failed to upload image');
        }
    };

    useEffect(() => {
        // Skip confetti logic on initial load
        if (isInitialLoadRef.current) {
            if (user) {
                // If user is loaded, we can mark initial load as done
                isInitialLoadRef.current = false;
                // If already 100%, mark as shown so it doesn't trigger later unless it drops and goes back up
                if (completion === 100) {
                    hasShownConfettiRef.current = true;
                }
            }
            return;
        }

        // Only show confetti once when profile reaches 100% completion
        if (completion === 100 && !hasShownConfettiRef.current) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#8b5cf6', '#d946ef', '#06b6d4'], // Modern gradient colors
                disableForReducedMotion: true
            });
            toast.success("🎉 Profile 100% Complete! You're all set!");
            hasShownConfettiRef.current = true;
        }

        // Reset confetti flag if profile becomes incomplete again
        if (completion < 100) {
            hasShownConfettiRef.current = false;
        }
    }, [completion, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            toast.success('Profile updated successfully!');
        } catch {
            toast.error('Failed to update profile');
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Profile Completion Card - Only show when profile is incomplete */}
            {completion < 100 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-6 shadow-sm"
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Complete Your Profile</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">You&apos;re almost there! Add missing details.</p>
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{completion}%</span>
                    </div>
                    <Progress value={completion} className="h-2.5 bg-purple-100 dark:bg-purple-900/40" indicatorClassName="bg-gradient-to-r from-purple-600 to-blue-500" />
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Visual Profile Header */}
                <div className="relative group rounded-3xl overflow-hidden bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm">
                    {/* Cover Image */}
                    <div className="h-48 sm:h-64 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                        {formData.coverPicture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={formData.coverPicture}
                                alt="Cover"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                        )}

                        {/* Cover Upload Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                            <div className="bg-white/10 p-4 rounded-full backdrop-blur-md border border-white/20">
                                <ImageUpload
                                    value={formData.coverPicture}
                                    onChange={(url) => setFormData(prev => ({ ...prev, coverPicture: url }))}
                                    aspectRatio="wide"
                                    onUpload={(file) => handleImageUpload(file, 'cover')}
                                    className="text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Profile Info Section */}
                    <div className="px-6 pb-6 pt-16 sm:pt-0 relative">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 sm:-mt-16 mb-4 gap-4 sm:gap-6">
                            {/* Profile Picture */}
                            <div className="relative">
                                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-gray-950 shadow-xl bg-white dark:bg-gray-900 overflow-hidden relative group/profile">
                                    {formData.profilePicture ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={formData.profilePicture}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 text-4xl font-bold">
                                            {formData.name?.charAt(0).toUpperCase() || <User className="w-12 h-12" />}
                                        </div>
                                    )}

                                    {/* Profile Upload Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/profile:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <ImageUpload
                                            value={formData.profilePicture}
                                            onChange={(url) => setFormData(prev => ({ ...prev, profilePicture: url }))}
                                            aspectRatio="square"
                                            imageClassName="rounded-full"
                                            className='rounded-full text-white'
                                            onUpload={(file) => handleImageUpload(file, 'profile')}
                                        />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-950 shadow-sm" title="Online" />
                            </div>

                            {/* Name & Bio */}
                            <div className="flex-1 pt-2 sm:pb-4">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                    {formData.name || 'Your Name'}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                    {formData.email}
                                </p>
                            </div>

                            <Button type="submit" disabled={isLoading} className="mb-4 sm:mb-6 shadow-lg shadow-purple-500/20 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-8">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Personal Information */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-sm h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <CardTitle>Personal Information</CardTitle>
                            </div>
                            <CardDescription>
                                Manage your personal details and public profile info.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled
                                        className="pl-9 bg-gray-50 dark:bg-gray-900 text-gray-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="+1 234 567 890"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us a little about yourself..."
                                    className="resize-none min-h-[100px]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-sm h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <CardTitle>Security & Account</CardTitle>
                            </div>
                            <CardDescription>
                                Update your password and secure your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" placeholder="••••••••" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" placeholder="••••••••" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" placeholder="••••••••" />
                            </div>

                            <div className="pt-4">
                                <Button variant="outline" className="w-full border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                    Update Password
                                </Button>
                            </div>

                            <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800">
                                <h4 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h4>
                                <Button variant="destructive" className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:border-red-900/50">
                                    Delete Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}

export default function SettingsPage() {
    const { user } = useAuthStore();

    return (
        <PageLayout
            title="Settings"
            description="Manage your account settings and preferences."
        >
            <SettingsContent key={user?._id || 'loading'} />
        </PageLayout>
    );
}
