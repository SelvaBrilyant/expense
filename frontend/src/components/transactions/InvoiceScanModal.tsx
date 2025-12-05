'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Camera, Loader2, FileImage, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { AxiosError } from 'axios';

export interface ParsedInvoiceData {
    title: string;
    amount: number;
    date: string;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    paymentMethod: string;
    notes: string;
    items: Array<{ name: string; quantity: number; price: number }>;
}

interface InvoiceScanModalProps {
    open: boolean;
    onClose: () => void;
    onDataExtracted: (data: ParsedInvoiceData) => void;
}

export function InvoiceScanModal({ open, onClose, onDataExtracted }: InvoiceScanModalProps) {
    const [scanning, setScanning] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload an image (JPEG, PNG, WebP) or PDF file');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl('');
        }
    }, []);

    const handleScan = async () => {
        if (!selectedFile) {
            toast.error('Please select an invoice file first');
            return;
        }

        setScanning(true);
        try {
            const formData = new FormData();
            formData.append('invoice', selectedFile);

            const response = await api.post('/ai/parse-invoice', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success && response.data.data) {
                toast.success('Invoice scanned successfully! Form has been pre-filled.');
                onDataExtracted(response.data.data);
                handleClose();
            } else {
                toast.error(response.data.error || 'Failed to extract data from invoice');
            }
        } catch (error) {
            console.error('Invoice scan error:', error);
            const axiosError = error as AxiosError<{ error: string }>;
            toast.error(axiosError.response?.data?.error || 'Failed to scan invoice. Please try again.');
        } finally {
            setScanning(false);
        }
    };

    const handleClose = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl('');
        onClose();
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            // Create a mock event to pass to handleFileSelect
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            const event = {
                target: { files: dataTransfer.files }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileSelect(event);
        }
    }, [handleFileSelect]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Scan Invoice with AI
                    </DialogTitle>
                    <DialogDescription>
                        Upload an invoice or receipt image to automatically extract transaction details using AI.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!selectedFile ? (
                        <div
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors bg-gray-50 dark:bg-gray-800/50"
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleFileSelect}
                            />
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                    <Camera className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-200">
                                        Drop your invoice here or click to browse
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Supports JPEG, PNG, WebP, and PDF (max 10MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative border rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                {previewUrl ? (
                                    <div className="relative w-full h-[300px]">
                                        <Image
                                            src={previewUrl}
                                            alt="Invoice preview"
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center p-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileImage className="h-12 w-12 text-gray-400" />
                                            <p className="text-sm text-gray-500">{selectedFile.name}</p>
                                        </div>
                                    </div>
                                )}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                                        setSelectedFile(null);
                                        setPreviewUrl('');
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-gray-500 text-center">
                                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 justify-end pt-4">
                        <Button variant="outline" onClick={handleClose} disabled={scanning}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleScan}
                            disabled={!selectedFile || scanning}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            {scanning ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Scanning with AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Extract Details
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
