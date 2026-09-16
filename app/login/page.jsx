'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Check role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profile && profile.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
            router.refresh();
        } catch (err) {
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
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
                        <Sparkles className="w-3.5 h-3.5" /> CREATIVE × DIGITAL × TECHNOLOGY
                    </div>
                    <h1 className="text-4xl font-black tracking-tight leading-tight">
                        BE GLOBALLY SEEN.
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Don't just exist online. Make an impact. Sign in to track your creative assets, project statuses, and order deliverables in real-time.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-gray-500 border-t border-gray-800 pt-6">
                    © {new Date().getFullYear()} Synth Media Agency. All rights reserved.
                </div>
            </div>

            {/* Right side form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <div className="lg:hidden flex items-center mb-6">
                            <Logo variant="dark" size="md" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                        <p className="mt-1 text-sm text-gray-500">Sign in to manage your services, projects and deliverables.</p>
                    </div>

                    {error && (
                        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            required
                            placeholder="your@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                                    Password <span className="text-pink-500">*</span>
                                </label>
                                <Link href="/forgot-password" className="text-xs text-purple-600 hover:text-purple-700 font-semibold">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button type="submit" isLoading={loading} className="w-full py-3 mt-2">
                            Sign In <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <p className="text-center text-xs text-gray-600 font-medium">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-purple-600 font-bold hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
