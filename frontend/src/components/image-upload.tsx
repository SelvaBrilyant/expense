"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
    aspectRatio?: "square" | "wide";
}

export function ImageUpload({
    value,
    onChange,
    className,
    aspectRatio = "square",
}: ImageUploadProps) {
    const [preview, setPreview] = React.useState<string | undefined>(value);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPreview(base64);
                onChange(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setPreview(undefined);
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={cn("relative", className)}>
            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Preview"
                        className={cn(
                            "w-full object-cover rounded-lg",
                            aspectRatio === "square" ? "aspect-square" : "aspect-video"
                        )}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors flex flex-col items-center justify-center bg-purple-50 dark:bg-purple-950/20",
                        aspectRatio === "square" ? "aspect-square" : "aspect-video"
                    )}
                >
                    <Upload className="h-8 w-8 text-purple-400 dark:text-purple-500 mb-2" />
                    <p className="text-sm text-purple-600 dark:text-purple-400">Click to upload image</p>
                    <p className="text-xs text-purple-500 dark:text-purple-500 mt-1">
                        PNG, JPG, GIF up to 2MB
                    </p>
                </div>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
