'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit2, Check, X, Package } from 'lucide-react';

export default function AdminPackagesManager({ initialPackages }) {
    const [packages, setPackages] = useState(initialPackages || []);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ price: '', delivery_days: '', revisions: '' });
    const [loadingId, setLoadingId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();
    const supabase = createClient();

    const startEditing = (pkg) => {
        setEditingId(pkg.id);
        setEditForm({
            price: pkg.price,
            delivery_days: pkg.delivery_days || '',
            revisions: pkg.revisions || '',
        });
        setMessage('');
        setError('');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({ price: '', delivery_days: '', revisions: '' });
    };

    const handleSave = async (id) => {
        setLoadingId(id);
        setMessage('');
        setError('');

        try {
            const numPrice = parseFloat(editForm.price);
            if (isNaN(numPrice) || numPrice < 0) {
                throw new Error('Please enter a valid price.');
            }

            const { error: updateError } = await supabase
                .from('packages')
                .update({
                    price: numPrice,
                    delivery_days: parseInt(editForm.delivery_days) || 1,
                    revisions: parseInt(editForm.revisions) || 0,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            setPackages(packages.map(p => p.id === id ? {
                ...p,
                price: numPrice,
                delivery_days: parseInt(editForm.delivery_days) || p.delivery_days,
                revisions: parseInt(editForm.revisions) || p.revisions
            } : p));

            setMessage('Package pricing and details updated successfully!');
            setEditingId(null);
            router.refresh();
        } catch (err) {
            setError(err.message || 'Failed to update package.');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {message && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold">
                    {message}
                </div>
            )}
            {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 bg-gray-900/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="py-3.5 px-4">Package</th>
                            <th className="py-3.5 px-4">Service Category</th>
                            <th className="py-3.5 px-4">Price (NGN)</th>
                            <th className="py-3.5 px-4">Delivery</th>
                            <th className="py-3.5 px-4">Revisions</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                        {packages.map((pkg) => {
                            const isEditing = editingId === pkg.id;
                            return (
                                <tr key={pkg.id} className="hover:bg-gray-900/30 transition-colors">
                                    <td className="py-4 px-4 font-bold text-white">{pkg.name}</td>
                                    <td className="py-4 px-4 text-pink-400 font-semibold">{pkg.services?.name}</td>
                                    <td className="py-4 px-4 font-extrabold text-white">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editForm.price}
                                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                className="w-28 bg-gray-900 border border-pink-500/50 text-white rounded px-2 py-1 text-xs font-bold focus:outline-none"
                                            />
                                        ) : (
                                            formatCurrency(pkg.price)
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-gray-400">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editForm.delivery_days}
                                                onChange={(e) => setEditForm({ ...editForm, delivery_days: e.target.value })}
                                                className="w-16 bg-gray-900 border border-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none"
                                            />
                                        ) : (
                                            `${pkg.delivery_days} Days`
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-gray-400">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editForm.revisions}
                                                onChange={(e) => setEditForm({ ...editForm, revisions: e.target.value })}
                                                className="w-16 bg-gray-900 border border-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none"
                                            />
                                        ) : (
                                            `${pkg.revisions} Revisions`
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        {isEditing ? (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleSave(pkg.id)}
                                                    disabled={loadingId === pkg.id}
                                                    className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors"
                                                    title="Save changes"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="p-1.5 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startEditing(pkg)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-pink-400 hover:text-pink-300 hover:underline"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" /> Edit Price
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
