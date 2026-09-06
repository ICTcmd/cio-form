/**
 * Supabase Edge Function: notify-admin
 *
 * Triggered by a Supabase Database Webhook on INSERT to the `requests` table.
 * Sends an HTML email to designated admin Gmail accounts via the Resend API.
 *
 * Required environment secrets (set in Supabase Dashboard → Settings → Edge Functions):
 *   RESEND_API_KEY   — your Resend API key (https://resend.com)
 *   NOTIFY_EMAILS    — comma-separated list of admin email addresses
 *   ADMIN_DASHBOARD_URL — e.g. https://cio-bago.digital/admin-dashboard
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY      = Deno.env.get('RESEND_API_KEY') ?? '';
const NOTIFY_EMAILS       = Deno.env.get('NOTIFY_EMAILS') ?? '';
const ADMIN_DASHBOARD_URL = Deno.env.get('ADMIN_DASHBOARD_URL') ?? 'https://cio-bago.digital/admin-dashboard';

// ---- Helpers ----------------------------------------------------------------

function escHtml(str: string | null | undefined): string {
  return String(str ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00');
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function servicesList(services: string[] | null | undefined): string {
  if (!Array.isArray(services) || !services.length) return '—';
  return services.map(s => `<li style="margin-bottom:4px;">${escHtml(s)}</li>`).join('');
}

// ---- Email builder ----------------------------------------------------------

function buildEmailHtml(req: Record<string, unknown>): string {
  const services   = Array.isArray(req.services) ? req.services as string[] : [];
  const cloudLink  = typeof req.cloud_drive_link === 'string' ? req.cloud_drive_link : null;
  const attachName = typeof req.attachment_name === 'string' ? req.attachment_name : null;

  const attachSection = (attachName || cloudLink) ? `
    <tr>
      <td style="padding:20px 32px;">
        <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">
          Attachments &amp; Links
        </p>
        ${attachName ? `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;">
          <span style="font-size:18px;">📎</span>
          <span style="font-size:13px;color:#0f172a;font-weight:500;">${escHtml(attachName)}</span>
        </div>` : ''}
        ${cloudLink ? `
        <a href="${escHtml(cloudLink)}" style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;color:#15803d;font-size:13px;font-weight:600;text-decoration:none;">
          📂 Open External Cloud Link (Google Drive / OneDrive)
        </a>` : ''}
      </td>
    </tr>` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:#0f172a;padding:24px 32px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#60a5fa;">
              City Information Office — Bago City
            </p>
            <h1 style="margin:8px 0 0;font-size:20px;font-weight:800;color:#ffffff;line-height:1.3;">
              🚨 New Service Request Submitted
            </h1>
          </td>
        </tr>

        <!-- CONTROL NUMBER BANNER -->
        <tr>
          <td style="background:#1d4ed8;padding:12px 32px;">
            <p style="margin:0;font-size:13px;color:#bfdbfe;">Control Number</p>
            <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;">
              ${escHtml(req.control_number as string)}
            </p>
          </td>
        </tr>

        <!-- REQUEST INFO -->
        <tr>
          <td style="padding:24px 32px 0;">
            <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">
              Request Details
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;width:40%;">
                  <span style="font-size:12px;color:#94a3b8;font-weight:500;">Requesting Office</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                  <span style="font-size:13px;color:#0f172a;font-weight:600;">${escHtml(req.requesting_office as string)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                  <span style="font-size:12px;color:#94a3b8;font-weight:500;">Contact Person</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                  <span style="font-size:13px;color:#0f172a;">${escHtml(req.contact_person as string)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                  <span style="font-size:12px;color:#94a3b8;font-weight:500;">Phone / Viber</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                  <span style="font-size:13px;color:#0f172a;">${escHtml(req.contact_no as string)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                  <span style="font-size:12px;color:#94a3b8;font-weight:500;">Event / Activity</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                  <span style="font-size:13px;color:#0f172a;font-weight:600;">${escHtml(req.event_activity as string)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                  <span style="font-size:12px;color:#94a3b8;font-weight:500;">Event Date &amp; Time</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                  <span style="font-size:13px;color:#0f172a;">${fmtDate(req.event_date as string)} at ${fmtTime(req.event_time as string)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <span style="font-size:12px;color:#94a3b8;font-weight:500;">Venue</span>
                </td>
                <td style="padding:8px 0;">
                  <span style="font-size:13px;color:#0f172a;">${escHtml(req.event_venue as string)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SERVICES -->
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">
              Services Requested
            </p>
            <ul style="margin:0;padding-left:20px;font-size:13px;color:#0f172a;line-height:1.8;">
              ${servicesList(services)}
            </ul>
          </td>
        </tr>

        <!-- ATTACHMENTS -->
        ${attachSection}

        <!-- CTA BUTTON -->
        <tr>
          <td style="padding:28px 32px;">
            <a href="${ADMIN_DASHBOARD_URL}"
               style="display:inline-block;padding:14px 28px;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.2px;">
              View in Admin Dashboard →
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
              This is an automated notification from the <strong>CIO Request Portal</strong>.<br>
              City Information Office — City Government of Bago, Western Visayas, Philippines.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---- Main handler -----------------------------------------------------------

serve(async (req: Request) => {
  try {
    // Supabase Database Webhooks POST the new row as JSON
    const body = await req.json();

    // The webhook sends { type, table, record, old_record, schema }
    // For a direct HTTP test it may just be the record itself
    const record: Record<string, unknown> = body?.record ?? body;

    if (!record?.control_number) {
      return new Response(JSON.stringify({ error: 'No record data' }), { status: 400 });
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not set');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500 });
    }

    const toAddresses = NOTIFY_EMAILS
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    if (!toAddresses.length) {
      console.error('NOTIFY_EMAILS not set');
      return new Response(JSON.stringify({ error: 'No recipient addresses configured' }), { status: 500 });
    }

    const emailHtml = buildEmailHtml(record);
    const subject   = `🚨 New CIO Request: ${record.control_number} — ${record.requesting_office ?? ''}`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'CIO Portal <noreply@cio-bago.digital>',
        to:      toAddresses,
        subject: subject,
        html:    emailHtml,
      }),
    });

    const resendJson = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend error:', resendJson);
      return new Response(JSON.stringify({ error: resendJson }), { status: 502 });
    }

    console.log('Email sent:', resendJson.id, '→', toAddresses);
    return new Response(JSON.stringify({ success: true, id: resendJson.id }), { status: 200 });

  } catch (err) {
    console.error('notify-admin error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
