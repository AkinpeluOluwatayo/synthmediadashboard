'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setError('');

        const cleanPassword = password.trim();
        const cleanConfirm = confirmPassword.trim();

        if (cleanPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (cleanPassword !== cleanConfirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: cleanPassword,
            });

            if (updateError) throw updateError;

            setToastMessage('Password Updated Successfully');
            setTimeout(() => {
                router.push('/login');
                router.refresh();
            }, 1200);
        } catch (err) {
            setError(err.message || 'Failed to update password. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left side branding banner (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-950 p-12 text-white flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <Logo variant="light" size="lg" />
                </div>

                <div className="relative z-10 space-y-6 max-w-md">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5" /> SECURE ACCOUNT RECOVERY
                    </div>
                    <h1 className="text-4xl font-black tracking-tight leading-tight">
                        Reset Your Password.
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Create a strong, new password to regain full access to your Synth Media portal account.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-gray-500 border-t border-gray-800 pt-6">
                    © {new Date().getFullYear()} Synth Media Agency. All rights reserved.
                </div>
            </div>

            {/* Right side form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-6">
                    <div>
                        <div className="lg:hidden flex items-center mb-6">
                            <Logo variant="dark" size="md" />
                        </div>
                        <div className="inline-flex items-center gap-2 p-2.5 bg-purple-50 text-purple-600 rounded-xl mb-3">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Set New Password</h2>
                        <p className="mt-1 text-sm text-gray-500">Please enter your new password below.</p>
                    </div>

                    {error && (
                        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <Input
                            label="New Password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Input
                            label="Confirm New Password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <Button type="submit" isLoading={loading} className="w-full py-3 mt-2">
                            Update Password <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <p className="text-center text-xs text-gray-600 font-medium">
                        Remembered your password?{' '}
                        <Link href="/login" className="text-purple-600 font-bold hover:underline">
                            Back to Sign In
                        </Link>
                    </p>
                </div>
            </div>

            {/* Success Toast Notification */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-950 text-emerald-100 border border-emerald-500/30 px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-5 duration-300">
                    <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <p className="text-sm font-bold text-white">{toastMessage}</p>
                </div>
            )}
        </div>
    );
}
