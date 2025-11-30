'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

export interface TransactionItem {
    name: string;
    quantity: number;
    price: number;
}

interface TransactionItemFormProps {
    items: TransactionItem[];
    onChange: (items: TransactionItem[]) => void;
    onTotalChange?: (total: number) => void;
}

export function TransactionItemForm({ items, onChange, onTotalChange }: TransactionItemFormProps) {
    const addItem = () => {
        onChange([...items, { name: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
        updateTotal(newItems);
    };

    const updateItem = (index: number, field: keyof TransactionItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange(newItems);
        updateTotal(newItems);
    };

    const updateTotal = (itemsList: TransactionItem[]) => {
        const total = itemsList.reduce((sum, item) => sum + item.quantity * item.price, 0);
        if (onTotalChange) {
            onTotalChange(total);
        }
    };

    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Itemized List (Optional)</label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>

            {items.length > 0 && (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                            <div className="flex-1 space-y-2">
                                <Input
                                    placeholder="Item name"
                                    value={item.name}
                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Qty"
                                        value={item.quantity || ''}
                                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        step="0.01"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Price"
                                        value={item.price || ''}
                                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Subtotal: ₹{(item.quantity * item.price).toFixed(2)}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(index)}
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}

                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg font-semibold">
                        <span>Calculated Total:</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
