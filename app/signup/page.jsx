'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        businessName: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        business_name: formData.businessName,
                    },
                },
            });

            if (authError) throw authError;

            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
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

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-synth-gradient flex items-center justify-center font-black text-xl shadow-lg">
                        S
                    </div>
                    <div>
                        <span className="font-extrabold text-xl tracking-tight block">SYNTH MEDIA</span>
                        <span className="text-[10px] font-bold text-pink-500 tracking-widest uppercase">AGENCY PORTAL</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-6 max-w-md">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5" /> JOIN SYNTH MEDIA PLATFORM
                    </div>
                    <h1 className="text-4xl font-black tracking-tight leading-tight">
                        Start Managing Your Creative & Digital Growth Projects.
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Create an account to submit project briefs, upload brand guidelines, choose service packages, and receive high-quality deliverables.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-gray-500 border-t border-gray-800 pt-6">
                    © {new Date().getFullYear()} Synth Media Agency. All rights reserved.
                </div>
            </div>

            {/* Right side signup form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
                <div className="w-full max-w-md space-y-6">
                    <div>
                        <div className="lg:hidden flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-synth-gradient flex items-center justify-center text-white font-black text-base">
                                S
                            </div>
                            <span className="font-bold text-gray-900 tracking-tight">SYNTH MEDIA</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create your Synth account</h2>
                        <p className="mt-1 text-sm text-gray-500">Start managing your creative, digital and technology projects.</p>
                    </div>

                    {error && (
                        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <Input
                            label="Full Name"
                            name="fullName"
                            required
                            placeholder="e.g. John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                        />

                        <Input
                            label="Business / Organization Name"
                            name="businessName"
                            placeholder="e.g. Acme Creative Ltd"
                            value={formData.businessName}
                            onChange={handleChange}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                required
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <Input
                                label="Phone / WhatsApp"
                                name="phone"
                                placeholder="+234 800 000 0000"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <Input
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <Button type="submit" isLoading={loading} className="w-full py-3 mt-2">
                            Create Account <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <p className="text-center text-xs text-gray-600 font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-purple-600 font-bold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
