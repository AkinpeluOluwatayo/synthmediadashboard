'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, FileText, Download, CheckCircle2, ShieldAlert, Plus, Send } from 'lucide-react';

export default function AdminOrderDetailManager({ order, customer, service, pkg, orderFiles, deliverables, adminNotes, currentAdmin }) {
    const [status, setStatus] = useState(order.status);
    const [deliverableName, setDeliverableName] = useState('');
    const [deliverableUrl, setDeliverableUrl] = useState('');
    const [newNote, setNewNote] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleStatusUpdate = async () => {
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    status,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', order.id);

            if (updateError) throw updateError;

            setMessage(`Order status updated to ${status}.`);
            router.refresh();
        } catch (err) {
            setError(err.message || 'Failed to update order status.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDeliverable = async (e) => {
        e.preventDefault();
        if (!deliverableName || !deliverableUrl) {
            setError('Please provide deliverable title and URL.');
            return;
        }

        setLoading(true);
        try {
            const { error: delivError } = await supabase
                .from('deliverables')
                .insert({
                    order_id: order.id,
                    file_name: deliverableName,
                    file_url: deliverableUrl,
                    storage_provider: 'supabase',
                    released: true,
                });

            if (delivError) throw delivError;

            setDeliverableName('');
            setDeliverableUrl('');
            setMessage('Project deliverable file attached successfully.');
            router.refresh();
        } catch (err) {
            setError(err.message || 'Failed to attach deliverable.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote) return;

        try {
            await supabase.from('admin_notes').insert({
                order_id: order.id,
                admin_id: currentAdmin.id,
                note: newNote,
            });
            setNewNote('');
            router.refresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AdminLayout userProfile={currentAdmin}>
            <div className="space-y-8">
                <div>
                    <Link href="/admin/orders" className="inline-flex items-center text-xs font-semibold text-pink-400 hover:underline mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders List
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-pink-400">#{order.order_number}</span>
                                <StatusBadge status={order.status} />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight mt-1">{order.project_title}</h1>
                            <p className="text-xs text-gray-400">{service?.name} • {pkg?.name} Package</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-xs text-gray-400 block uppercase font-medium">Contract Value</span>
                            <span className="text-2xl font-black text-white">{formatCurrency(order.amount)}</span>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Brief & Deliverables */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Control Card */}
                        <div className="p-6 bg-gray-950 rounded-xl border border-gray-800 space-y-4">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">Update Order Status</h2>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="flex-1 w-full bg-gray-900 border border-gray-800 rounded-lg text-sm text-white px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 font-semibold"
                                >
                                    <option value="PAID">Payment Confirmed</option>
                                    <option value="IN_PRODUCTION">In Production</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                                <Button onClick={handleStatusUpdate} isLoading={loading} className="w-full sm:w-auto px-6 py-2.5">
                                    Update Status
                                </Button>
                            </div>
                        </div>

                        {/* Attach Deliverable Card */}
                        <div className="p-6 bg-gray-950 rounded-xl border border-gray-800 space-y-4">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">Attach Completed Deliverables</h2>
                            <form onSubmit={handleAddDeliverable} className="space-y-4">
                                <Input
                                    label="Deliverable File Name / Title"
                                    required
                                    placeholder="e.g. Final Flyer Vector PSD & PNG Bundle"
                                    value={deliverableName}
                                    onChange={(e) => setDeliverableName(e.target.value)}
                                    className="bg-gray-900 border-gray-800 text-white"
                                />
                                <Input
                                    label="File Download URL / Google Drive Share Link"
                                    required
                                    placeholder="https://..."
                                    value={deliverableUrl}
                                    onChange={(e) => setDeliverableUrl(e.target.value)}
                                    className="bg-gray-900 border-gray-800 text-white"
                                />
                                <Button type="submit" isLoading={loading} className="w-full py-2.5">
                                    <Plus className="w-4 h-4 mr-1" /> Attach Deliverable File
                                </Button>
                            </form>

                            {deliverables && deliverables.length > 0 && (
                                <div className="pt-4 border-t border-gray-800 space-y-2">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase">Released Deliverables:</span>
                                    {deliverables.map((del) => (
                                        <div key={del.id} className="p-3 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-between text-xs">
                                            <span className="font-bold text-white truncate">{del.file_name}</span>
                                            <a href={del.file_url} target="_blank" rel="noreferrer" className="text-pink-400 font-bold hover:underline">
                                                Open Link
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Project Requirements & Brief */}
                        <div className="p-6 bg-gray-950 rounded-xl border border-gray-800 space-y-4">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">Submitted Project Brief</h2>
                            <div>
                                <span className="text-[11px] font-semibold text-gray-500 uppercase block">Description</span>
                                <p className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">{order.project_description}</p>
                            </div>
                            {order.instructions && (
                                <div className="pt-3 border-t border-gray-800">
                                    <span className="text-[11px] font-semibold text-gray-500 uppercase block">Guidelines / Rules</span>
                                    <p className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">{order.instructions}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Sidebar Customer Info & Notes */}
                    <div className="space-y-6">
                        <div className="p-6 bg-gray-950 rounded-xl border border-gray-800 space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">Client Profile</h3>
                            <div className="space-y-2 text-xs">
                                <div>
                                    <span className="text-gray-500 block">Name</span>
                                    <span className="font-bold text-white">{customer?.full_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Email</span>
                                    <span className="font-bold text-white">{customer?.email}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Organization</span>
                                    <span className="font-bold text-white">{customer?.business_name || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Internal Notes */}
                        <div className="p-6 bg-gray-950 rounded-xl border border-gray-800 space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-3">Internal Operations Notes</h3>
                            <form onSubmit={handleAddNote} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add internal note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500"
                                />
                                <button type="submit" className="p-2 bg-synth-gradient text-white rounded-lg">
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {(adminNotes || []).map((note) => (
                                    <div key={note.id} className="p-2.5 bg-gray-900 rounded-lg text-xs text-gray-300">
                                        <p>{note.note}</p>
                                        <span className="text-[10px] text-gray-500 block mt-1">{formatDate(note.created_at)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
