'use client';

import { useState, KeyboardEvent } from 'react';
import { X, Tag, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Suggested tags for quick selection
const SUGGESTED_TAGS = [
    { label: 'Essential', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Recurring', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    { label: 'One-time', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { label: 'Business', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    { label: 'Personal', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
    { label: 'Tax Deductible', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    { label: 'Planned', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
];

interface TagInputProps {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    maxTags?: number;
    placeholder?: string;
    className?: string;
}

export function TagInput({
    tags,
    onTagsChange,
    maxTags = 10,
    placeholder = 'Add a tag...',
    className,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
            onTagsChange([...tags, trimmedTag]);
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onTagsChange(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    const getTagColor = (tag: string) => {
        const suggestedTag = SUGGESTED_TAGS.find(
            s => s.label.toLowerCase() === tag.toLowerCase()
        );
        return suggestedTag?.color || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    };

    const availableSuggestions = SUGGESTED_TAGS.filter(
        s => !tags.some(t => t.toLowerCase() === s.label.toLowerCase())
    );

    return (
        <div className={cn('space-y-3', className)}>
            {/* Tags Display */}
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className={cn(
                            'px-2.5 py-1 text-sm font-medium transition-all',
                            getTagColor(tag)
                        )}
                    >
                        <Tag className="h-3 w-3 mr-1.5" />
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1.5 hover:text-red-600 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>

            {/* Input */}
            {tags.length < maxTags && (
                <div className="relative">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder={placeholder}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => addTag(inputValue)}
                            disabled={!inputValue.trim()}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && availableSuggestions.length > 0 && (
                        <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-900 border rounded-lg shadow-lg p-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-1">
                                Suggested tags:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {availableSuggestions.map((suggestion) => (
                                    <Badge
                                        key={suggestion.label}
                                        variant="secondary"
                                        className={cn(
                                            'cursor-pointer hover:opacity-80 transition-opacity',
                                            suggestion.color
                                        )}
                                        onClick={() => {
                                            addTag(suggestion.label);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        {suggestion.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tag count */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
                {tags.length}/{maxTags} tags used
            </p>
        </div>
    );
}
