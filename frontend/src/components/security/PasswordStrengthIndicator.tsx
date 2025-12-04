'use client';

import { useMemo } from 'react';

export interface PasswordStrength {
    score: number; // 0-4
    label: string;
    color: string;
    suggestions: string[];
}

export function usePasswordStrength(password: string): PasswordStrength {
    return useMemo(() => {
        if (!password) {
            return {
                score: 0,
                label: 'Very Weak',
                color: 'bg-red-500',
                suggestions: ['Password is required'],
            };
        }

        let score = 0;
        const suggestions: string[] = [];

        // Length check
        if (password.length >= 8) score++;
        else suggestions.push('Use at least 8 characters');

        if (password.length >= 12) score++;

        // Uppercase check
        if (/[A-Z]/.test(password)) score++;
        else suggestions.push('Add uppercase letters');

        // Lowercase check
        if (/[a-z]/.test(password)) score++;
        else suggestions.push('Add lowercase letters');

        // Number check
        if (/\d/.test(password)) score++;
        else suggestions.push('Add numbers');

        // Special character check
        if (/[@$!%*?&]/.test(password)) score++;
        else suggestions.push('Add special characters (@$!%*?&)');

        // Common patterns penalty
        if (/^(password|12345|qwerty|admin)/i.test(password)) {
            score = Math.max(0, score - 2);
            suggestions.push('Avoid common passwords');
        }

        // Sequential characters penalty
        if (/(.)\1{2,}/.test(password)) {
            score = Math.max(0, score - 1);
            suggestions.push('Avoid repeating characters');
        }

        // Normalize score to 0-4
        const normalizedScore = Math.min(4, Math.floor(score / 1.5));

        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = [
            'bg-red-500',
            'bg-orange-500',
            'bg-yellow-500',
            'bg-lime-500',
            'bg-green-500',
        ];

        return {
            score: normalizedScore,
            label: labels[normalizedScore],
            color: colors[normalizedScore],
            suggestions: suggestions.slice(0, 3), // Show top 3 suggestions
        };
    }, [password]);
}

interface PasswordStrengthIndicatorProps {
    password: string;
    showSuggestions?: boolean;
}

export function PasswordStrengthIndicator({
    password,
    showSuggestions = true,
}: PasswordStrengthIndicatorProps) {
    const strength = usePasswordStrength(password);

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            {/* Strength Bar */}
            <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= strength.score
                            ? strength.color
                            : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                    />
                ))}
            </div>

            {/* Label */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Password strength:</span>
                <span
                    className={`font-medium ${strength.score === 0
                        ? 'text-red-600'
                        : strength.score === 1
                            ? 'text-orange-600'
                            : strength.score === 2
                                ? 'text-yellow-600'
                                : strength.score === 3
                                    ? 'text-lime-600'
                                    : 'text-green-600'
                        }`}
                >
                    {strength.label}
                </span>
            </div>

            {/* Suggestions */}
            {showSuggestions && strength.suggestions.length > 0 && strength.score < 4 && (
                <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">Suggestions:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        {strength.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
