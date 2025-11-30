'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera, Save, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

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

    // Calculate profile completion
    const fields = ['name', 'email', 'bio', 'phoneNumber', 'dateOfBirth', 'profilePicture', 'coverPicture'];
    const filledFields = fields.filter(field => formData[field as keyof typeof formData]);
    const completion = Math.round((filledFields.length / fields.length) * 100);

    useEffect(() => {
        if (completion === 100) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#7c3aed', '#6d28d9', '#a78bfa'] // Purple theme colors
            });
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
            {/* Profile Completion Card */}
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

            <form onSubmit={handleSubmit} className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>
                            Update your personal information and public profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Cover Picture & Profile Picture */}
                        <div className="relative group">
                            <div className="h-48 w-full rounded-xl bg-gradient-to-r from-purple-400 to-blue-500 overflow-hidden relative">
                                {formData.coverPicture ? (
                                    <img src={formData.coverPicture} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/50">
                                        No Cover Photo
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Label htmlFor="coverPicture" className="cursor-pointer bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors">
                                        <Camera className="h-6 w-6" />
                                    </Label>
                                    <Input
                                        id="coverPicture"
                                        name="coverPicture"
                                        value={formData.coverPicture}
                                        onChange={handleChange}
                                        className="hidden"
                                        placeholder="Enter Image URL"
                                    />
                                    {/* For a real app, this would be a file upload. Using URL input for simplicity as per current structure */}
                                </div>
                            </div>

                            <div className="absolute -bottom-12 left-8">
                                <div className="relative group/avatar">
                                    <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-950 shadow-lg">
                                        <AvatarImage src={formData.profilePicture} />
                                        <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
                                            {formData.name?.charAt(0).toUpperCase() || <User />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                        <Label htmlFor="profilePicture" className="cursor-pointer text-white">
                                            <Camera className="h-5 w-5" />
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* URL Inputs for Images (Temporary UI for URL entry since we don't have file upload logic yet) */}
                        <div className="grid gap-4 pt-10 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="profilePictureInput">Profile Picture URL</Label>
                                <Input
                                    id="profilePictureInput"
                                    name="profilePicture"
                                    value={formData.profilePicture}
                                    onChange={handleChange}
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="coverPictureInput">Cover Picture URL</Label>
                                <Input
                                    id="coverPictureInput"
                                    name="coverPicture"
                                    value={formData.coverPicture}
                                    onChange={handleChange}
                                    placeholder="https://example.com/cover.jpg"
                                />
                            </div>
                        </div>

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
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen dark:bg-gray-900">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <SettingsContent key={user?._id || 'loading'} />
        </div>
    );
}
