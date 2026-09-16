'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Building, Phone, Mail, CheckCircle2 } from 'lucide-react';

export default function CustomerProfilePage() {
    const [profile, setProfile] = useState(null);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    React.useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) {
                    setProfile(data);
                    setFullName(data.full_name || '');
                    setPhone(data.phone || '');
                    setBusinessName(data.business_name || '');
                }
            }
        }
        loadProfile();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone,
                    business_name: businessName,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', profile.id);

            if (updateError) throw updateError;

            setMessage('Your account profile details have been updated successfully.');
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout userProfile={profile}>
            <div className="max-w-3xl space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Account & Business Profile</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Manage your personal contact details and organization information.
                    </p>
                </div>

                {message && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> {message}
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                        {error}
                    </div>
                )}

                <Card className="p-6">
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                            <div className="w-16 h-16 rounded-full bg-synth-gradient text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                                {fullName ? fullName.slice(0, 2).toUpperCase() : 'SM'}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">{profile?.email}</h2>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-100 text-purple-700 uppercase">
                                    {profile?.role || 'Customer'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />

                            <Input
                                label="Business / Organization Name"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                            />

                            <Input
                                label="Phone / WhatsApp Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />

                            <div className="w-full">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                                    Email Address (Read Only)
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    value={profile?.email || ''}
                                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <Button type="submit" isLoading={loading} className="px-6 py-2.5">
                            Save Changes
                        </Button>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
