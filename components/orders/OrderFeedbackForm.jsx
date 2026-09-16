'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';

export function OrderFeedbackForm({ orderId, customerId, initialFeedback }) {
    const [rating, setRating] = useState(initialFeedback?.rating || 5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState(initialFeedback?.comment || '');
    const [feedback, setFeedback] = useState(initialFeedback || null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(!!initialFeedback);
    const [error, setError] = useState('');

    const supabase = createClient();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            setError('Please select a star rating.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data, error: dbError } = await supabase
                .from('order_feedback')
                .upsert({
                    order_id: orderId,
                    customer_id: customerId,
                    rating: rating,
                    comment: comment,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'order_id' })
                .select()
                .single();

            if (dbError) throw dbError;

            setFeedback(data);
            setSubmitted(true);
        } catch (err) {
            console.error('Feedback submit error:', err);
            setError(err.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 bg-gradient-to-br from-purple-900/5 via-white to-pink-900/5 border-purple-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-900">Project Feedback & Rating</h3>
                    <p className="text-xs text-gray-500">How satisfied are you with our creative output and service?</p>
                </div>
            </div>

            {submitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Thank you for your valuable feedback!
                    </div>
                    <div className="flex items-center gap-1 py-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-4 h-4 ${star <= (feedback?.rating || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    {feedback?.comment && (
                        <p className="text-xs text-gray-700 italic bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                            "{feedback.comment}"
                        </p>
                    )}
                    <button
                        onClick={() => setSubmitted(false)}
                        className="text-[11px] font-bold text-purple-600 hover:underline pt-1 block"
                    >
                        Edit Feedback
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                            Select Rating
                        </label>
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled = star <= (hoverRating || rating);
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-6 h-6 ${isFilled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                                        />
                                    </button>
                                );
                            })}
                            <span className="ml-2 text-xs font-bold text-gray-700">
                                {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                                {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                                {rating === 3 && '⭐⭐⭐ Good'}
                                {rating === 2 && '⭐⭐ Fair'}
                                {rating === 1 && '⭐ Poor'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Comments / Suggestions
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Tell us what you liked or how we can improve our deliverables..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <Button type="submit" isLoading={loading} className="w-full sm:w-auto px-6 py-2.5">
                        Submit Feedback
                    </Button>
                </form>
            )}
        </Card>
    );
}
