import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OrderCreationForm from '@/components/orders/OrderCreationForm';

export default async function OrderCreationPageWrapper({ params, searchParams }) {
    const { id } = await params;
    const { packageId } = await searchParams;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    const { data: service } = await supabase
        .from('services')
        .select('*, packages(*)')
        .eq('id', id)
        .single();

    if (!service) {
        notFound();
    }

    const selectedPackage = (service.packages || []).find(p => p.id === packageId) || service.packages?.[0];

    if (!selectedPackage) {
        notFound();
    }

    return (
        <OrderCreationForm
            service={service}
            selectedPackage={selectedPackage}
            profile={profile}
        />
    );
}
