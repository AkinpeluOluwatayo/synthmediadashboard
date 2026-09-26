import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function GET() {
    try {
        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ status: 'healthy', database: 'skipped_no_env' }, { status: 200 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Ping database by fetching active services count
        const { count, error } = await supabase
            .from('services')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Keep-alive ping DB warning:', error.message);
            return NextResponse.json({ status: 'healthy', database: 'warning', detail: error.message }, { status: 200 });
        }

        return NextResponse.json({
            status: 'healthy',
            database: 'connected',
            servicesCount: count,
            timestamp: new Date().toISOString(),
        }, { status: 200 });
    } catch (err) {
        console.error('Keep-alive ping error:', err);
        return NextResponse.json({ status: 'degraded', error: err.message }, { status: 200 });
    }
}
