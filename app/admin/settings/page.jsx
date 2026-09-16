import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Settings, ShieldCheck } from 'lucide-react';

export default async function AdminSettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id || '').single();

    return (
        <AdminLayout userProfile={profile}>
            <div className="space-y-8 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Portal Settings</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">System status and architecture details.</p>
                </div>

                <div className="p-6 bg-gray-950 rounded-xl border border-gray-800 space-y-4">
                    <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                        <ShieldCheck className="w-5 h-5" /> Synth Media Agency Portal v1.0
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        All database tables are secured using Supabase Row Level Security (RLS). Integration placeholders for Paystack, Google Drive, and Make automation are configured.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
