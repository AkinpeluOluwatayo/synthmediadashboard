'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile`,
            });

            if (resetError) throw resetError;

            setMessage('Password reset instructions have been sent to your email address.');
        } catch (err) {
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-8 space-y-6">
                <div>
                    <Link href="/login" className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-700 mb-6">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sign In
                    </Link>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Forgot Password</h2>
                    <p className="mt-1 text-sm text-gray-500">Enter your email address and we'll send you instructions to reset your password.</p>
                </div>

                {message ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-emerald-900">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Reset Link Sent
                        </div>
                        <p>{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        {error && (
                            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                                {error}
                            </div>
                        )}
                        <Input
                            label="Email Address"
                            type="email"
                            required
                            placeholder="your@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button type="submit" isLoading={loading} className="w-full py-3">
                            Send Reset Instructions
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
