import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Star, MessageSquare, ArrowRight, User, ShoppingBag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminFeedbackPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    // Fetch all feedback submissions
    let feedbackList = [];
    let tableMissing = false;

    try {
        const { data, error } = await supabase
            .from('order_feedback')
            .select('*, orders(order_number, project_title), profiles(full_name, email, business_name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('order_feedback error:', error);
            if (error.code === '42P01' || error.message?.includes('schema cache')) {
                tableMissing = true;
            }
        } else {
            feedbackList = data || [];
        }
    } catch (err) {
        console.warn('order_feedback table query caught:', err);
        tableMissing = true;
    }

    const totalFeedback = feedbackList?.length || 0;
    const avgRating = totalFeedback > 0
        ? (feedbackList.reduce((acc, f) => acc + (f.rating || 0), 0) / totalFeedback).toFixed(1)
        : '5.0';

    return (
        <AdminLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-pink-500 uppercase tracking-widest mb-1">
                        <MessageSquare className="w-4 h-4" /> Client Voice & Satisfaction
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Client Feedback Ledger</h1>
                    <p className="text-xs text-gray-400 mt-1">Review ratings, testimonials, and quality suggestions submitted by your agency clients.</p>
                </div>

                {/* Rating KPI Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gray-950 border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl">
                            ★
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Average Satisfaction Score</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-2xl font-black text-white">{avgRating} / 5.0</span>
                                <span className="text-xs text-amber-400 font-bold">({totalFeedback} Reviews)</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gray-950 border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-black text-xl">
                            💬
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Reviews Received</span>
                            <span className="text-2xl font-black text-white mt-0.5 block">{totalFeedback}</span>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gray-950 border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xl">
                            🏆
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">5-Star Excellence Rate</span>
                            <span className="text-2xl font-black text-white mt-0.5 block">
                                {totalFeedback > 0
                                    ? `${Math.round((feedbackList.filter(f => f.rating === 5).length / totalFeedback) * 100)}%`
                                    : '100%'}
                            </span>
                        </div>
                    </Card>
                </div>

                {/* Feedback List */}
                <Card className="p-6 bg-gray-950 border-gray-800 space-y-6">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-4">
                        Submitted Client Testimonials & Feedback
                    </h2>

                    {(!feedbackList || feedbackList.length === 0) ? (
                        <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
                            <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-gray-300">No Feedback Submitted Yet</h3>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                When clients review their completed deliverables on their portal order page, their ratings and comments will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {feedbackList.map((item) => (
                                <div key={item.id} className="p-5 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/60 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-400 font-bold flex items-center justify-center text-xs shrink-0">
                                                {item.profiles?.full_name?.charAt(0) || 'C'}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white">{item.profiles?.full_name || 'Client'}</h4>
                                                <span className="text-[11px] text-gray-400">{item.profiles?.business_name || item.profiles?.email}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[11px] text-gray-500">{formatDate(item.created_at)}</span>
                                        </div>
                                    </div>

                                    {item.comment ? (
                                        <p className="text-xs text-gray-200 leading-relaxed italic bg-gray-950 p-3 rounded-lg border border-gray-800">
                                            "{item.comment}"
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">No written comment attached with star rating.</p>
                                    )}

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
                                            <span>Order #{item.orders?.order_number}: <strong className="text-gray-200">{item.orders?.project_title}</strong></span>
                                        </div>
                                        <Link
                                            href={`/admin/orders/${item.order_id}`}
                                            className="text-xs font-bold text-pink-400 hover:underline flex items-center gap-1"
                                        >
                                            View Order <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}
