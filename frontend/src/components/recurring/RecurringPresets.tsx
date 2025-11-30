'use client';

import { Coffee, Home, Newspaper, Droplet, Zap, Wifi } from 'lucide-react';

interface Preset {
    title: string;
    frequency: string;
    amount: string;
    category: string;
    icon: React.ReactNode;
}

const PRESETS: Preset[] = [
    {
        title: 'Daily Milk',
        frequency: 'DAILY',
        amount: '30',
        category: 'Groceries',
        icon: <Coffee className="h-4 w-4" />,
    },
    {
        title: 'Newspaper',
        frequency: 'DAILY',
        amount: '10',
        category: 'Bills',
        icon: <Newspaper className="h-4 w-4" />,
    },
    {
        title: 'Water Can',
        frequency: 'WEEKLY',
        amount: '60',
        category: 'Groceries',
        icon: <Droplet className="h-4 w-4" />,
    },
    {
        title: 'Rent',
        frequency: 'MONTHLY',
        amount: '15000',
        category: 'Bills',
        icon: <Home className="h-4 w-4" />,
    },
    {
        title: 'Electricity Bill',
        frequency: 'MONTHLY',
        amount: '1500',
        category: 'Bills',
        icon: <Zap className="h-4 w-4" />,
    },
    {
        title: 'Internet',
        frequency: 'MONTHLY',
        amount: '999',
        category: 'Bills',
        icon: <Wifi className="h-4 w-4" />,
    },
];

interface RecurringPresetsProps {
    onSelectPreset: (preset: Omit<Preset, 'icon'>) => void;
}

export function RecurringPresets({ onSelectPreset }: RecurringPresetsProps) {
    return (
        <div>
            <h3 className="text-sm font-medium mb-3">Quick Add Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {PRESETS.map((preset, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectPreset({
                            title: preset.title,
                            frequency: preset.frequency,
                            amount: preset.amount,
                            category: preset.category,
                        })}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                    >
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                            {preset.icon}
                        </div>
                        <span className="text-xs font-medium text-center">{preset.title}</span>
                        <span className="text-xs text-muted-foreground">₹{preset.amount}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
