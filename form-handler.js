// CSB Quote Request — form handler
// Posts to Cloudflare Worker (SMS notification) + Supabase (data storage)

// Configure after deploy:
const WORKER_URL = 'https://csb-notify.garenhudson.workers.dev';
const SUPABASE_URL = 'https://lnicydkhiuzatcwgfwtt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuaWN5ZGtoaXV6YXRjd2dmd3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MjUxMzgsImV4cCI6MjA4OTIwMTEzOH0.hRudIkq3h5TxhnRAS9XRDVZ5RVvspogEt273Yw3R3-o';

var PITD_LABELS = ['Chill', 'Some coordination', 'Wedding-level stress'];

document.addEventListener('DOMContentLoaded', function() {
  var form = document.querySelector('.contact-form');
  var btn = form.querySelector('.btn-submit');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Sending...';

    var payload = {
      track: 'guided',
      client_name: document.getElementById('cn').value,
      client_email: document.getElementById('ce').value,
      event_type: document.getElementById('ct').value || null,
      event_date: document.getElementById('cd').value || null,
      details: document.getElementById('cm').value || null,
      pitd: document.getElementById('pitd').value,
      status: 'new'
    };

    var results = { worker: false, supabase: false };

    // Send SMS notification via Cloudflare Worker
    if (WORKER_URL) {
      try {
        var wRes = await fetch(WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        results.worker = wRes.ok;
      } catch (err) { console.error('Worker error:', err); }
    }

    // Store in Supabase
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        var sRes = await fetch(SUPABASE_URL + '/rest/v1/quote_requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });
        results.supabase = sRes.ok;
      } catch (err) { console.error('Supabase error:', err); }
    }

    // If either worked, show success. Otherwise fall back to mailto.
    if (results.worker || results.supabase) {
      showSuccess();
    } else {
      fallbackMailto(payload);
    }
  });

  function showSuccess() {
    var pitdVal = parseInt(document.getElementById('pitd').value);
    var extra = pitdVal === 2 ? '<p style="color:var(--accent);font-size:0.9rem;margin-top:0.75rem">Mike has been warned about the stress level.</p>' : '';
    form.innerHTML = '<div style="text-align:center;padding:3rem 1rem"><h3 style="font-size:1.5rem;margin-bottom:1rem;color:var(--text-primary)">Got it!</h3><p style="color:var(--text-secondary);font-size:1.05rem">Mike will review your request and get back to you within 24 hours.</p>' + extra + '</div>';
  }

  function fallbackMailto(p) {
    var subject = 'Quote Request' + (p.event_type ? ' — ' + p.event_type : '');
    var body = 'Name: ' + p.client_name + '\nEmail: ' + p.client_email;
    if (p.event_type) body += '\nEvent Type: ' + p.event_type;
    if (p.event_date) body += '\nEvent Date: ' + p.event_date;
    body += '\nPITD: ' + PITD_LABELS[parseInt(p.pitd) || 1];
    if (p.details) body += '\n\n' + p.details;
    window.location.href = 'mailto:soundandbackline@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    btn.disabled = false;
    btn.textContent = 'Send Quote Request';
  }
});
