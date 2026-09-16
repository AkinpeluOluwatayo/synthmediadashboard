import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminOrderDetailManager from '@/components/admin/AdminOrderDetailManager';

export default async function AdminOrderDetailPageWrapper({ params }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: currentAdmin } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    const { data: order } = await supabase
        .from('orders')
        .select('*, profiles(*), services(*), packages(*)')
        .eq('id', id)
        .single();

    if (!order) {
        notFound();
    }

    const { data: orderFiles } = await supabase.from('order_files').select('*').eq('order_id', order.id);
    const { data: deliverables } = await supabase.from('deliverables').select('*').eq('order_id', order.id);
    const { data: adminNotes } = await supabase.from('admin_notes').select('*').eq('order_id', order.id).order('created_at', { ascending: false });

    return (
        <AdminOrderDetailManager
            order={order}
            customer={order.profiles}
            service={order.services}
            pkg={order.packages}
            orderFiles={orderFiles || []}
            deliverables={deliverables || []}
            adminNotes={adminNotes || []}
            currentAdmin={currentAdmin}
        />
    );
}
