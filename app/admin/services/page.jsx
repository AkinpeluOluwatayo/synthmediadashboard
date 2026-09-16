import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Sparkles } from 'lucide-react';

export default async function AdminServicesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id || '').single();
    const { data: services } = await supabase.from('services').select('*, packages(*)').order('created_at', { ascending: true });

    return (
        <AdminLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Services Directory</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Manage agency service pillars and catalog items.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(services || []).map((srv) => (
                        <div key={srv.id} className="p-5 bg-gray-950 rounded-xl border border-gray-800 space-y-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 uppercase">
                                {srv.category}
                            </span>
                            <h3 className="text-base font-bold text-white">{srv.name}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2">{srv.description}</p>
                            <div className="pt-2 text-xs font-semibold text-gray-500">
                                {srv.packages?.length || 0} Package(s) configured
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
