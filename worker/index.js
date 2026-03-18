// CSB Quote Request Handler — Cloudflare Worker
// Receives form submissions, sends SMS to Mike, returns JSON
//
// Environment variables (set in Cloudflare dashboard):
//   TWILIO_SID        — Twilio Account SID
//   TWILIO_AUTH_TOKEN  — Twilio Auth Token
//   TWILIO_FROM        — Twilio phone number (e.g., +1234567890)
//   MIKE_PHONE         — Mike's phone number (e.g., +17082031313)

const PITD_LABELS = ['Chill', 'Some coordination', 'Wedding-level stress'];

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const data = await request.json();
      const { client_name, client_email, event_type, event_date, details, pitd } = data;

      // Build SMS message
      const pitdLabel = PITD_LABELS[parseInt(pitd) || 1];
      let msg = `New CSB quote request!\n`;
      msg += `From: ${client_name} (${client_email})\n`;
      if (event_type) msg += `Type: ${event_type}\n`;
      if (event_date) msg += `Date: ${event_date}\n`;
      msg += `PITD: ${pitdLabel}\n`;
      if (details) msg += `\n${details.substring(0, 200)}`;

      // Send SMS via Twilio
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_SID}/Messages.json`;
      const twilioAuth = btoa(`${env.TWILIO_SID}:${env.TWILIO_AUTH_TOKEN}`);

      const smsRes = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: env.MIKE_PHONE,
          From: env.TWILIO_FROM,
          Body: msg,
        }).toString(),
      });

      const smsResult = await smsRes.json();
      const smsOk = smsRes.ok;

      return new Response(JSON.stringify({
        ok: true,
        sms_sent: smsOk,
        sms_sid: smsResult.sid || null,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
