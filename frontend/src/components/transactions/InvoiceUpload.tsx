'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface InvoiceUploadProps {
    onUploadComplete: (url: string) => void;
    initialUrl?: string;
}

export function InvoiceUpload({ onUploadComplete, initialUrl }: InvoiceUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [invoiceUrl, setInvoiceUrl] = useState(initialUrl || '');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const url = response.data.url;
            setInvoiceUrl(url);
            onUploadComplete(url);
            toast.success('Invoice uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload invoice');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setInvoiceUrl('');
        onUploadComplete('');
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Invoice (Optional)</label>

            {invoiceUrl ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    <a
                        href={invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-primary hover:underline truncate"
                    >
                        View Invoice
                    </a>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                        disabled={uploading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                        id="invoice-upload"
                    />
                    <label
                        htmlFor="invoice-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                    >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm">
                            {uploading ? (
                                <span>Uploading...</span>
                            ) : (
                                <>
                                    <span className="font-medium text-primary">Click to upload</span>
                                    <span className="text-muted-foreground"> or drag and drop</span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">PDF up to 5MB</p>
                    </label>
                </div>
            )}
        </div>
    );
}
