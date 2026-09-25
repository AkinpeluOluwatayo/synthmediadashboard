import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Initialize Supabase Service Client for Webhook (bypasses RLS safely for payment updates)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
    try {
        const bodyText = await request.text();
        const paystackSignature = request.headers.get('x-paystack-signature');
        const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

        // Verify Signature if Secret Key is configured in environment
        if (paystackSecret && paystackSignature) {
            const hash = crypto.createHmac('sha512', paystackSecret).update(bodyText).digest('hex');
            if (hash !== paystackSignature) {
                return NextResponse.json({ error: 'Invalid Paystack signature' }, { status: 401 });
            }
        }

        const event = JSON.parse(bodyText);

        // Process successful payment event
        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;
            const amountPaid = data.amount / 100; // Paystack sends kobo/cents
            const customerEmail = data.customer?.email;

            // Attempt to match order by reference or metadata
            let orderId = data.metadata?.order_id;
            let orderNumber = data.metadata?.order_number;

            // Search order in Supabase
            let targetOrder = null;

            if (orderId) {
                const { data: ord } = await supabase.from('orders').select('*').eq('id', orderId).single();
                targetOrder = ord;
            } else if (orderNumber) {
                const { data: ord } = await supabase.from('orders').select('*').eq('order_number', orderNumber).single();
                targetOrder = ord;
            }

            // Fallback: search pending payment record by reference
            if (!targetOrder) {
                const { data: existingPay } = await supabase
                    .from('payments')
                    .select('*, orders(*)')
                    .or(`reference.eq.${reference},reference.ilike.%${reference}%`)
                    .single();

                if (existingPay?.orders) {
                    targetOrder = existingPay.orders;
                }
            }

            // Fallback: search most recent pending order for this customer email
            if (!targetOrder && customerEmail) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', customerEmail)
                    .single();

                if (profile) {
                    const { data: recentPending } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('customer_id', profile.id)
                        .eq('status', 'PENDING_PAYMENT')
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    targetOrder = recentPending;
                }
            }

            if (targetOrder) {
                // 1. Update Order status to PAID
                await supabase
                    .from('orders')
                    .update({ status: 'PAID', updated_at: new Date().toISOString() })
                    .eq('id', targetOrder.id);

                // 2. Upsert Payment Ledger Record
                const { data: existingPay } = await supabase
                    .from('payments')
                    .select('id')
                    .eq('order_id', targetOrder.id)
                    .maybeSingle();

                if (existingPay) {
                    await supabase
                        .from('payments')
                        .update({
                            reference: reference,
                            amount: amountPaid || targetOrder.amount,
                            status: 'successful',
                            provider: 'paystack',
                            paid_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', existingPay.id);
                } else {
                    await supabase.from('payments').insert({
                        order_id: targetOrder.id,
                        customer_id: targetOrder.customer_id,
                        amount: amountPaid || targetOrder.amount,
                        currency: targetOrder.currency || 'NGN',
                        reference: reference,
                        status: 'successful',
                        provider: 'paystack',
                        paid_at: new Date().toISOString(),
                    });
                }
            }
        }

        return NextResponse.json({ status: 'success', received: true });
    } catch (err) {
        console.error('Paystack webhook error:', err);
        return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
    }
}
