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
        const currentYear = new Date().getFullYear();

        const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0b0f17 0%,#1a1035 50%,#2d1a4e 100%);padding:40px 32px;text-align:center;">
              <h1 style="margin:0;color:#ec4899;font-size:22px;font-weight:900;letter-spacing:1.5px;">SYNTH MEDIA AGENCY</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Creative × Digital × Technology</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 32px 16px;">
              <h2 style="margin:0;color:#111827;font-size:20px;font-weight:800;">🎉 Your Project Is Ready!</h2>
              <p style="margin:12px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
                Hi <strong style="color:#111827;">${customerName || 'Valued Client'}</strong>,
              </p>
              <p style="margin:8px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
                Great news! Our creative team has completed work on your project and your deliverables are now ready for download.
              </p>
            </td>
          </tr>

          <!-- Project Details Card -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom:12px;border-bottom:1px solid #e5e7eb;">
                          <span style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Project</span><br/>
                          <span style="font-size:15px;font-weight:800;color:#111827;">${projectTitle}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:12px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="50%">
                                <span style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Order No.</span><br/>
                                <span style="font-size:13px;font-weight:700;color:#ec4899;">#${orderNumber}</span>
                              </td>
                              <td width="50%">
                                <span style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Status</span><br/>
                                <span style="display:inline-block;background:#d1fae5;color:#065f46;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">✅ Completed</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Deliverable File -->
          <tr>
            <td style="padding:20px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,#0b0f17,#1a1035);border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Deliverable File</span>
                    <p style="margin:6px 0 14px;color:#ffffff;font-size:14px;font-weight:700;">${deliverableName}</p>
                    <a href="${deliverableUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#ec4899,#a855f7);color:#ffffff;padding:11px 28px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.3px;">
                      ⬇ Download Your Files
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Portal Link -->
          <tr>
            <td style="padding:24px 32px 8px;text-align:center;">
              <a href="${portalUrl}" target="_blank" style="display:inline-block;background:#ffffff;color:#7c3aed;border:2px solid #7c3aed;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;">
                View Order in Client Portal →
              </a>
            </td>
          </tr>

          <!-- Support Note -->
          <tr>
            <td style="padding:16px 32px 32px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                Need revisions or have feedback? Reply to this email or reach out via WhatsApp.
                We're always here to help your brand shine.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:11px;font-weight:600;">
                © ${currentYear} Synth Media Agency. All rights reserved.
              </p>
              <p style="margin:6px 0 0;color:#d1d5db;font-size:10px;">
                Creative × Digital × Technology — synthmediaagency.vercel.app
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        // Send via Resend API if configured
        if (process.env.RESEND_API_KEY) {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: process.env.RESEND_FROM_EMAIL || 'Synth Media Agency <notifications@synthmedia.agency>',
                    to: [customerEmail],
                    subject: `🎉 Your Project "${projectTitle}" Is Ready — Order #${orderNumber}`,
                    html: emailHtml,
                })
            });

            const data = await res.json();

            if (!res.ok) {
                console.error('Resend API error:', data);
                return NextResponse.json({ error: data?.message || 'Email delivery failed' }, { status: 500 });
            }

            return NextResponse.json({ success: true, resendId: data.id });
        }

        // Fallback / simulation when email provider is not yet configured
        console.log(`[Email Notification Triggered] To: ${customerEmail}, Project: ${projectTitle}, File: ${deliverableName}`);

        return NextResponse.json({
            success: true,
            message: 'Delivery notification registered successfully (email provider not configured — will log only)',
            details: { customerEmail, projectTitle, deliverableName, portalUrl }
        });
    } catch (err) {
        console.error('Email notification error:', err);
        return NextResponse.json({ error: err.message || 'Failed to send notification' }, { status: 500 });
    }
}
