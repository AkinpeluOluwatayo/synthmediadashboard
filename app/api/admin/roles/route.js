import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const supabase = await createClient();

        // Check current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
        }

        // Verify requesting user is the designated Super Admin
        const { data: requesterProfile } = await supabase
            .from('profiles')
            .select('email, role')
            .eq('id', user.id)
            .single();

        const SUPER_ADMIN_EMAIL = 'akinpeluoluwatayo1235@gmail.com';

        if (
            !requesterProfile ||
            requesterProfile.role !== 'admin' ||
            requesterProfile.email?.toLowerCase() !== SUPER_ADMIN_EMAIL
        ) {
            return NextResponse.json(
                { error: 'Forbidden. Only the Super Admin can modify user roles.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { userId, targetRole } = body;

        if (!userId || !['admin', 'customer'].includes(targetRole)) {
            return NextResponse.json(
                { error: 'Invalid payload. userId and targetRole (admin|customer) are required.' },
                { status: 400 }
            );
        }

        // Update target user's role
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ role: targetRole, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            message: `User role successfully updated to ${targetRole}.`,
            profile: updatedProfile,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
    }
}
