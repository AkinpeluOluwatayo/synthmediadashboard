import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RoleToggleButton } from '@/components/admin/RoleToggleButton';
import { formatDate } from '@/lib/utils';
import { ShieldAlert, Sparkles } from 'lucide-react';

export default async function AdminCustomersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    // Fetch all profiles so Super Admin can manage roles for everyone
    const { data: allUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    const usersList = allUsers || [];
    const SUPER_ADMIN_EMAIL = 'akinpeluoluwatayo1235@gmail.com';
    const isSuperAdmin = profile?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

    return (
        <AdminLayout userProfile={profile}>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            User & Client Directory ({usersList.length})
                            {isSuperAdmin && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold">
                                    <Sparkles className="w-3.5 h-3.5" /> SUPER ADMIN CONTROL
                                </span>
                            )}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            {isSuperAdmin
                                ? 'Super Admin Mode: You can promote any client to Admin or revoke Admin status.'
                                : 'Registered agency clients, contact details, and organization information.'}
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4">User Name</th>
                                <th className="py-3.5 px-4">Email</th>
                                <th className="py-3.5 px-4">Phone / WhatsApp</th>
                                <th className="py-3.5 px-4">Organization</th>
                                <th className="py-3.5 px-4">Joined Date</th>
                                <th className="py-3.5 px-4 text-right">Role & Authorization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                            {usersList.map((usr) => {
                                const isThisSuperAdmin = usr.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
                                return (
                                    <tr key={usr.id} className="hover:bg-gray-900/50 transition-colors">
                                        <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                                            {usr.full_name}
                                            {isThisSuperAdmin && (
                                                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                                                    Primary Super Admin
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-gray-400">{usr.email}</td>
                                        <td className="py-4 px-4 text-gray-400">{usr.phone || 'N/A'}</td>
                                        <td className="py-4 px-4 font-semibold text-pink-400">{usr.business_name || 'Individual'}</td>
                                        <td className="py-4 px-4 text-gray-500">{formatDate(usr.created_at)}</td>
                                        <td className="py-4 px-4 text-right">
                                            {isThisSuperAdmin ? (
                                                <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                                                    SUPER ADMIN
                                                </span>
                                            ) : (
                                                <RoleToggleButton
                                                    userId={usr.id}
                                                    currentRole={usr.role}
                                                    isSuperAdmin={isSuperAdmin}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
