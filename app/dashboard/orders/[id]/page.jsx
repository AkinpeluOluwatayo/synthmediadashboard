import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, FileText, Download, Clock, CreditCard, Sparkles, FolderCheck } from 'lucide-react';

export default async function CustomerOrderDetailPage({ params }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    const { data: order } = await supabase
        .from('orders')
        .select('*, services(name, category, description), packages(name, features, revisions, delivery_days)')
        .eq('id', id)
        .eq('customer_id', user?.id || '')
        .single();

    if (!order) {
        notFound();
    }

    // Fetch Submitted Order Files
    const { data: orderFiles } = await supabase
        .from('order_files')
        .select('*')
        .eq('order_id', order.id);

    // Fetch Released Deliverables
    const { data: deliverables } = await supabase
        .from('deliverables')
        .select('*')
        .eq('order_id', order.id)
        .eq('released', true);

    return (
        <DashboardLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <Link href="/dashboard/orders" className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-700 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-purple-600">#{order.order_number}</span>
                                <StatusBadge status={order.status} />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">{order.project_title}</h1>
                            <p className="text-xs text-gray-500">{order.services?.name} • {order.packages?.name} Package</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-xs text-gray-400 block uppercase font-medium">Order Total</span>
                            <span className="text-2xl font-black text-gray-900">{formatCurrency(order.amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Visual Progress Timeline */}
                <Card className="p-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Production Timeline Status</h2>
                    <OrderStatusTimeline status={order.status} />
                </Card>

                {/* Ready Deliverables Section */}
                {deliverables && deliverables.length > 0 && (
                    <Card className="p-6 bg-emerald-50/70 border-emerald-300 space-y-4">
                        <div className="flex items-center gap-3 text-emerald-900">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                                🎉
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold">Your Project is Ready!</h3>
                                <p className="text-xs text-emerald-700">The creative team has released your final deliverable files below.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {deliverables.map((deliv) => (
                                <div key={deliv.id} className="p-4 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
                                    <div className="min-w-0 pr-2">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Deliverable File</span>
                                        <h4 className="text-xs font-bold text-gray-900 truncate">{deliv.file_name}</h4>
                                        <span className="text-[10px] text-gray-400">{formatDate(deliv.created_at)}</span>
                                    </div>
                                    <a
                                        href={deliv.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 shrink-0"
                                    >
                                        <Download className="w-4 h-4" /> Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Brief Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">Project Brief & Requirements</h2>

                            <div>
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Description</span>
                                <p className="text-xs text-gray-800 mt-1 whitespace-pre-wrap leading-relaxed">{order.project_description}</p>
                            </div>

                            {order.instructions && (
                                <div className="pt-3 border-t border-gray-100">
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Special Guidelines / Brand Rules</span>
                                    <p className="text-xs text-gray-800 mt-1 whitespace-pre-wrap leading-relaxed">{order.instructions}</p>
                                </div>
                            )}
                        </Card>

                        {/* Customer Submitted Files */}
                        <Card className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">Uploaded Requirement Files</h2>

                            {(!orderFiles || orderFiles.length === 0) ? (
                                <p className="text-xs text-gray-400 italic">No reference files attached for this order.</p>
                            ) : (
                                <div className="space-y-2">
                                    {orderFiles.map((f) => (
                                        <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                                            <div className="flex items-center gap-2 min-w-0 pr-2">
                                                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                                                <span className="font-semibold text-gray-800 truncate">{f.file_name}</span>
                                            </div>
                                            <a
                                                href={f.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-bold text-purple-600 hover:underline shrink-0"
                                            >
                                                View File
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Order Sidebar Details */}
                    <div className="space-y-6">
                        <Card className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">Order Details</h3>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="text-gray-400 block">Service Pillar</span>
                                    <span className="font-bold text-gray-900">{order.services?.category}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Package Selected</span>
                                    <span className="font-bold text-gray-900">{order.packages?.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Order Date</span>
                                    <span className="font-bold text-gray-900">{formatDate(order.created_at)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Target Deadline</span>
                                    <span className="font-bold text-gray-900">{formatDate(order.deadline)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
