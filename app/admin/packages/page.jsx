import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';
import AdminPackagesManager from '@/components/admin/AdminPackagesManager';

export default async function AdminPackagesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id || '').single();
    const { data: pkgs } = await supabase.from('packages').select('*, services(name, category)').order('price', { ascending: true });

    return (
        <AdminLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Packages & Pricing</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Edit package pricing, delivery timelines, and revision counts directly.</p>
                </div>

                <AdminPackagesManager initialPackages={pkgs || []} />
            </div>
        </AdminLayout>
    );
}
