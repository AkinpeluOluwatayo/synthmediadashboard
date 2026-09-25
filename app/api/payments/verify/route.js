import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('order_id');
        const reference = searchParams.get('reference') || searchParams.get('trxref');

        if (!orderId) {
            return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Fetch target order
        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderErr || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const refToUse = reference || `PAY-${order.order_number}-${Date.now()}`;

        // 2. Mark order as PAID
        await supabase
            .from('orders')
            .update({ status: 'PAID', updated_at: new Date().toISOString() })
            .eq('id', order.id);

        // 3. Upsert Payment Ledger Entry
        const { data: existingPay } = await supabase
            .from('payments')
            .select('id')
            .eq('order_id', order.id)
            .maybeSingle();

        if (existingPay) {
            await supabase
                .from('payments')
                .update({
                    reference: refToUse,
                    status: 'successful',
                    paid_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingPay.id);
        } else {
            await supabase.from('payments').insert({
                order_id: order.id,
                customer_id: order.customer_id,
                amount: order.amount,
                currency: order.currency || 'NGN',
                reference: refToUse,
                status: 'successful',
                provider: 'paystack',
                paid_at: new Date().toISOString(),
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified and recorded in ledgers.',
            order_id: order.id,
            status: 'PAID',
        });
    } catch (err) {
        return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 500 });
    }
}
