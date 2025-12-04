'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface PasswordStrengthIndicatorProps {
    password: string;
    showRequirements?: boolean;
    onChange?: (isValid: boolean, score: number) => void;
}

interface ValidationResult {
    isValid: boolean;
    score: number;
    strength: string;
    errors: string[];
    suggestions: string[];
}

const strengthColors: Record<string, string> = {
    'Very Weak': 'bg-red-500',
    'Weak': 'bg-orange-500',
    'Fair': 'bg-yellow-500',
    'Strong': 'bg-green-500',
    'Very Strong': 'bg-emerald-500',
};

const strengthTextColors: Record<string, string> = {
    'Very Weak': 'text-red-500',
    'Weak': 'text-orange-500',
    'Fair': 'text-yellow-500',
    'Strong': 'text-green-500',
    'Very Strong': 'text-emerald-500',
};

// Local validation for instant feedback
const localValidation = (password: string): { passed: string[]; failed: string[] } => {
    const requirements = [
        { label: 'At least 8 characters', test: password.length >= 8 },
        { label: 'One uppercase letter', test: /[A-Z]/.test(password) },
        { label: 'One lowercase letter', test: /[a-z]/.test(password) },
        { label: 'One number', test: /[0-9]/.test(password) },
        { label: 'One special character (!@#$%^&*...)', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
    ];

    return {
        passed: requirements.filter((r) => r.test).map((r) => r.label),
        failed: requirements.filter((r) => !r.test).map((r) => r.label),
    };
};

export function PasswordStrengthIndicator({
    password,
    showRequirements = true,
    onChange,
}: PasswordStrengthIndicatorProps) {
    const { validatePassword } = useAuthStore();
    const [validation, setValidation] = useState<ValidationResult | null>(null);

    // Use useMemo for instant local validation
    const localCheck = useMemo(() => {
        if (!password) {
            return { passed: [], failed: [] };
        }
        return localValidation(password);
    }, [password]);

    // Stable callback for validation
    const doValidation = useCallback(async (pwd: string) => {
        if (pwd.length > 0) {
            const result = await validatePassword(pwd);
            setValidation(result);
            onChange?.(result.isValid, result.score);
        } else {
            setValidation(null);
            onChange?.(false, 0);
        }
    }, [validatePassword, onChange]);

    // Debounced effect for API call
    useEffect(() => {
        // Always set up a timeout, even for empty password
        const timeoutId = setTimeout(() => {
            if (!password) {
                setValidation(null);
                onChange?.(false, 0);
            } else {
                doValidation(password);
            }
        }, password ? 300 : 0);

        return () => clearTimeout(timeoutId);
    }, [password, doValidation, onChange]);

    if (!password) {
        return null;
    }

    const progressValue = validation ? (validation.score / 5) * 100 : 0;
    const strength = validation?.strength || 'Checking...';

    return (
        <div className="space-y-3 mt-2">
            {/* Strength Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Password strength</span>
                    <span className={cn('font-medium', strengthTextColors[strength] || 'text-muted-foreground')}>
                        {strength}
                    </span>
                </div>
                <Progress
                    value={progressValue}
                    className="h-2"
                    indicatorClassName={cn(strengthColors[strength] || 'bg-muted')}
                />
            </div>

            {/* Requirements List */}
            {showRequirements && (
                <div className="space-y-1.5">
                    {localCheck.passed.map((req) => (
                        <div key={req} className="flex items-center gap-2 text-xs text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{req}</span>
                        </div>
                    ))}
                    {localCheck.failed.map((req) => (
                        <div key={req} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>{req}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Suggestions from server */}
            {validation?.suggestions && validation.suggestions.length > 0 && (
                <div className="space-y-1 pt-1 border-t">
                    {validation.suggestions.map((suggestion, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-amber-600">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{suggestion}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
