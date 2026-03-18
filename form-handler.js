// CSB Quote Request — Supabase form handler
// Configure these after Lovable creates the Supabase project:
const SUPABASE_URL = ''; // e.g. https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = ''; // public anon key (safe for client-side inserts)

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.contact-form');
  const btn = form.querySelector('.btn-submit');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const payload = {
      track: 'guided',
      client_name: document.getElementById('cn').value,
      client_email: document.getElementById('ce').value,
      event_type: document.getElementById('ct').value || null,
      event_date: document.getElementById('cd').value || null,
      details: document.getElementById('cm').value || null,
      status: 'new'
    };

    // If Supabase is configured, post there
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const res = await fetch(SUPABASE_URL + '/rest/v1/quote_requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Supabase error: ' + res.status);
        showSuccess();
      } catch (err) {
        console.error(err);
        fallbackMailto(payload);
      }
    } else {
      // Supabase not configured yet — fall back to mailto
      fallbackMailto(payload);
    }
  });

  function showSuccess() {
    form.innerHTML = '<div style="text-align:center;padding:3rem 1rem"><h3 style="font-size:1.5rem;margin-bottom:1rem;color:var(--text-primary)">Got it!</h3><p style="color:var(--text-secondary);font-size:1.05rem">Mike will review your request and get back to you within 24 hours.</p></div>';
  }

  function fallbackMailto(p) {
    var subject = 'Quote Request' + (p.event_type ? ' — ' + p.event_type : '');
    var body = 'Name: ' + p.client_name + '\nEmail: ' + p.client_email;
    if (p.event_type) body += '\nEvent Type: ' + p.event_type;
    if (p.event_date) body += '\nEvent Date: ' + p.event_date;
    if (p.details) body += '\n\n' + p.details;
    window.location.href = 'mailto:soundandbackline@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    btn.disabled = false;
    btn.textContent = 'Send Quote Request';
  }
});
