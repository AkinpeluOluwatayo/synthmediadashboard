import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            customerEmail,
            customerName,
            projectTitle,
            orderNumber,
            deliverableName,
            deliverableUrl,
            orderId
        } = body;

        if (!customerEmail) {
            return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
        }

        const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/orders/${orderId}`;

        // If RESEND_API_KEY is configured in env, send via Resend API
        if (process.env.RESEND_API_KEY) {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'Synth Media Agency <notifications@synthmedia.agency>',
                    to: [customerEmail],
                    subject: `🎉 Deliverables Released: ${projectTitle} (#${orderNumber})`,
                    html: `
                        <div style="font-family: sans-serif; background-color: #0b0f17; color: #ffffff; padding: 32px;">
                            <h2 style="color: #ec4899;">SYNTH MEDIA AGENCY</h2>
                            <h3>🎉 Your Creative Deliverables Are Ready!</h3>
                            <p>Hi ${customerName || 'Client'},</p>
                            <p>Our creative team has finalized and released your project files for <strong>${projectTitle}</strong> (Order #${orderNumber}).</p>
                            <div style="background: #111827; padding: 16px; border-radius: 8px; margin: 16px 0;">
                                <strong style="color: #10b981;">File: ${deliverableName}</strong><br><br>
                                <a href="${deliverableUrl}" style="background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none;">Download File &darr;</a>
                            </div>
                            <p><a href="${portalUrl}" style="color: #ec4899;">Click here to view your order in the Client Portal &rarr;</a></p>
                        </div>
                    `
                })
            });

            const data = await res.json();
            return NextResponse.json({ success: true, resendId: data.id });
        }

        // Fallback / simulation response when email provider API key is not yet set
        console.log(`[Email Notification Triggered] To: ${customerEmail}, Project: ${projectTitle}, File: ${deliverableName}`);

        return NextResponse.json({
            success: true,
            message: 'Delivery notification registered successfully',
            details: { customerEmail, projectTitle, deliverableName, portalUrl }
        });
    } catch (err) {
        console.error('Email notification error:', err);
        return NextResponse.json({ error: err.message || 'Failed to send notification' }, { status: 500 });
    }
}
