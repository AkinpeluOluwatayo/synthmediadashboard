'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, Loader2 } from 'lucide-react';

export function RoleToggleButton({ userId, currentRole, isSuperAdmin }) {
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState(currentRole);
    const router = useRouter();

    if (!isSuperAdmin) {
        return (
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${role === 'admin'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}>
                {role}
            </span>
        );
    }

    const handleRoleToggle = async () => {
        const nextRole = role === 'admin' ? 'customer' : 'admin';
        const confirmMsg = `Are you sure you want to change this user's role to ${nextRole.toUpperCase()}?`;
        if (!window.confirm(confirmMsg)) return;

        setLoading(true);

        try {
            const res = await fetch('/api/admin/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, targetRole: nextRole }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update user role');
            }

            setRole(nextRole);
            router.refresh();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleRoleToggle}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${role === 'admin'
                    ? 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border-purple-500/30'
                    : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border-gray-700'
                }`}
        >
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : role === 'admin' ? (
                <>
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Admin</span>
                    <span className="text-[10px] text-pink-400 underline ml-1">(Demote)</span>
                </>
            ) : (
                <>
                    <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>Customer</span>
                    <span className="text-[10px] text-emerald-400 underline ml-1">(Promote)</span>
                </>
            )}
        </button>
    );
}
