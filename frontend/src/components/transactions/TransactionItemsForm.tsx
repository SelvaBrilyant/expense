'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface TransactionItem {
    id?: string;
    name: string;
    quantity: number;
    price: number;
}

interface TransactionItemsFormProps {
    items: TransactionItem[];
    onItemsChange: (items: TransactionItem[]) => void;
    disabled?: boolean;
}

export function TransactionItemsForm({
    items,
    onItemsChange,
    disabled = false,
}: TransactionItemsFormProps) {
    const addItem = () => {
        onItemsChange([...items, { name: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onItemsChange(newItems);
    };

    const updateItem = (index: number, field: keyof TransactionItem, value: string | number) => {
        const newItems = items.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        onItemsChange(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Items (Optional)</label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    disabled={disabled}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                </Button>
            </div>

            {items.length > 0 && (
                <div className="space-y-2">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                        <div className="col-span-5">Item Name</div>
                        <div className="col-span-2">Qty</div>
                        <div className="col-span-3">Price</div>
                        <div className="col-span-2">Actions</div>
                    </div>

                    {/* Items */}
                    {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2">
                            <div className="col-span-5">
                                <Input
                                    placeholder="e.g., Milk"
                                    value={item.name}
                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="col-span-2">
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="col-span-3">
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.price}
                                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="col-span-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    disabled={disabled}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Total */}
                    <div className="flex justify-end pt-2 border-t">
                        <div className="text-sm font-medium">
                            Items Total: <span className="text-lg">₹{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
