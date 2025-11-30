'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { PageLayout } from '@/components/layout/PageLayout';
import { ImageUpload } from '@/components/image-upload';
import api from '@/lib/api';

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
        // Only show confetti once when profile reaches 100% completion
        if (completion === 100 && !hasShownConfettiRef.current) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#7c3aed', '#6d28d9', '#a78bfa'] // Purple theme colors
            });
            hasShownConfettiRef.current = true;
        }
        // Reset confetti flag if profile becomes incomplete again
        if (completion < 100) {
            hasShownConfettiRef.current = false;
        }
    }, [completion]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    return (
        <>
            {/* Profile Completion Card - Only show when profile is incomplete */}
            {completion < 100 && (
                <Card className="border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-purple-700 dark:text-purple-300 flex justify-between items-center">
                            Profile Completion
                            <span className="text-2xl font-bold">{completion}%</span>
                        </CardTitle>
                        <CardDescription className="text-purple-600/80 dark:text-purple-400/80">
                            Complete your profile to get the most out of ExpenseAI.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={completion} className="h-3 bg-purple-200 dark:bg-purple-900" indicatorClassName="bg-purple-600 dark:bg-purple-400" />
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>
                            Update your personal information and public profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Profile Preview Card with Integrated Upload */}
                        <Card className="border-purple-200 dark:border-purple-800 overflow-hidden">
                            <div className="relative">
                                {/* Cover Picture Preview with Upload */}
                                <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 relative overflow-hidden group cursor-pointer">
                                    {formData.coverPicture && (
                                        <img
                                            src={formData.coverPicture}
                                            alt="Cover"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                                    {/* Cover Upload Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                        <ImageUpload
                                            value={formData.coverPicture}
                                            onChange={(url) => setFormData(prev => ({ ...prev, coverPicture: url }))}
                                            aspectRatio="wide"
                                            onUpload={(file) => handleImageUpload(file, 'cover')}
                                        />
                                        <p className="text-white text-xs mt-2">Click to upload cover photo</p>
                                        <p className="text-white/70 text-xs">Recommended: 1200x400</p>
                                    </div>
                                </div>

                                {/* Profile Picture Preview with Upload */}
                                <div className="absolute -bottom-12 left-6 sm:left-8">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-gray-950 shadow-xl bg-purple-100 dark:bg-purple-900 overflow-hidden">
                                            {formData.profilePicture ? (
                                                <img
                                                    src={formData.profilePicture}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-purple-600 dark:text-purple-300 text-3xl font-bold">
                                                    {formData.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                            )}

                                            {/* Profile Upload Overlay */}
                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageUpload
                                                        value={formData.profilePicture}
                                                        onChange={(url) => setFormData(prev => ({ ...prev, profilePicture: url }))}
                                                        aspectRatio="square"
                                                        imageClassName="rounded-full"
                                                        className='rounded-full'
                                                        onUpload={(file) => handleImageUpload(file, 'profile')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
                                    </div>
                                </div>
                            </div>

                            {/* Name Preview */}
                            <CardContent className="pt-16 pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {formData.name || 'Your Name'}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {formData.email}
                                        </p>
                                    </div>
                                    <div className="mt-3 sm:mt-0">
                                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full inline-block">
                                            Profile Preview
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-muted-foreground">
                                    💡 Hover over the cover or profile picture to upload new photos
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" value={formData.email} onChange={handleChange} disabled className="bg-gray-100 dark:bg-gray-800" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+1 234 567 890" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                            </div>
                            <div className="col-span-2 space-y-2">
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
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white">
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>
                            Manage your password and security settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline">Update Password</Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </>
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
