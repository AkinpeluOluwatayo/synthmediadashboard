'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
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

    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [policyAgreed, setPolicyAgreed] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e) => {
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

        setShowPolicyModal(true);
    };

    const executeSignup = async () => {
        if (!policyAgreed) {
            setError('You must accept the terms and policies to proceed.');
            return;
        }

        setShowPolicyModal(false);
        setLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        business_name: formData.businessName,
                        policy_accepted: true,
                        policy_accepted_at: new Date().toISOString(),
                    },
                },
            });

            if (authError) throw authError;

            setToastMessage('Signup Successful');
            setTimeout(() => {
                router.push('/dashboard');
                router.refresh();
            }, 1200);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
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
                        <div className="lg:hidden flex items-center mb-6">
                            <Logo variant="dark" size="md" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create your Synth account</h2>
                        <p className="mt-1 text-sm text-gray-500">Start managing your creative, digital and technology projects.</p>
                    </div>

                    {error && (
                        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleFormSubmit} className="space-y-4">
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

            {/* Success Toast Notification */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-950 text-emerald-100 border border-emerald-500/30 px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-5 duration-300">
                    <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <p className="text-sm font-bold text-white">{toastMessage}</p>
                </div>
            )}

            {/* Policy Agreement Modal */}
            {showPolicyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Terms & Policy Agreement</h3>
                                <p className="text-xs text-gray-500">Please review and accept our policies to continue.</p>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100/80 leading-relaxed">
                            Before creating your account, please read and agree to the terms, conditions, and policies governing the use of Synth Media Agency services.
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer pt-1">
                            <input
                                type="checkbox"
                                checked={policyAgreed}
                                onChange={(e) => setPolicyAgreed(e.target.checked)}
                                className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 transition-colors"
                            />
                            <span className="text-xs text-gray-700 font-medium leading-normal">
                                I have read, understood, and agree to abide by the{' '}
                                <a
                                    href="https://synthmediaagency.vercel.app/policies.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 font-bold underline hover:text-purple-700 transition-colors"
                                >
                                    Synth Media Agency Policies
                                </a>.
                            </span>
                        </label>

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 py-2.5 text-xs font-semibold"
                                onClick={() => {
                                    setShowPolicyModal(false);
                                    setPolicyAgreed(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 py-2.5 text-xs font-semibold"
                                disabled={!policyAgreed}
                                onClick={executeSignup}
                            >
                                Agree & Continue
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
