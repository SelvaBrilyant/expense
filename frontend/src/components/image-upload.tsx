"use client";

import React from "react";
import { Upload, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
    aspectRatio?: "square" | "wide";
    imageClassName?: string;
    onUpload?: (file: File) => Promise<void>;
}

export function ImageUpload({
    value,
    onChange,
    className,
    aspectRatio = "square",
    imageClassName,
    onUpload,
}: ImageUploadProps) {
    const [preview, setPreview] = React.useState<string | undefined>(value);
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setPreview(value);
    }, [value]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        // Create preview immediately for better UX
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        setIsUploading(true);

        try {
            // If custom onUpload handler is provided, use it
            if (onUpload) {
                await onUpload(file);
            } else {
                // Otherwise use default upload logic
                const formData = new FormData();
                formData.append('image', file);

                const { data } = await api.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                setPreview(data.url);
                onChange(data.url);
                toast.success('Image uploaded successfully');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
            toast.error(errorMessage);
            setPreview(undefined);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={cn("relative", className)}>
            {preview ? (
                <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
                    <img
                        src={preview}
                        alt="Preview"
                        className={cn(
                            "w-full object-cover rounded-lg",
                            aspectRatio === "square" ? "aspect-square" : "aspect-video",
                            imageClassName
                        )}
                    />
                    <div className={cn(
                        "absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
                        imageClassName
                    )}>
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                                <p className="text-white text-xs">Uploading...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Camera className="h-6 w-6 text-white" />
                                <p className="text-white text-xs font-medium">Change Photo</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors flex flex-col items-center justify-center bg-purple-50 dark:bg-purple-950/20",
                        aspectRatio === "square" ? "aspect-square" : "aspect-video",
                        isUploading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-8 w-8 text-purple-400 dark:text-purple-500 mb-2 animate-spin" />
                            <p className="text-sm text-purple-600 dark:text-purple-400">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-purple-400 dark:text-purple-500 mb-2" />
                            <p className="text-sm text-purple-600 dark:text-purple-400">Click to upload image</p>
                            <p className="text-xs text-purple-500 dark:text-purple-500 mt-1">
                                PNG, JPG, WebP up to 5MB
                            </p>
                        </>
                    )}
                </div>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
            />
        </div>
    );
}
