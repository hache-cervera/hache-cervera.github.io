/* Cookie consent for the static pages (research and /work).
   Google Analytics loads only after "Accept". "Reject" is as easy as "Accept",
   the choice is stored locally, and any link with [data-cookies] reopens the banner. */
(function () {
  var GA_ID = 'G-6JCDHFSJ4M';
  var KEY = 'consent-analytics';
  var es = (document.documentElement.lang || '').indexOf('es') === 0;
  var T = es
    ? { text: 'Uso Google Analytics para saber cuánta gente lee esto. Solo se activa si aceptas.', yes: 'Aceptar', no: 'Rechazar', label: 'Cookies' }
    : { text: 'I use Google Analytics to see how many people read this. It only runs if you accept.', yes: 'Accept', no: 'Reject', label: 'Cookies' };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var loaded = false;
  function loadGA() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  var css =
    '.hc-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:34rem;margin-left:auto;' +
    'display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px;padding:16px 18px;background:#0a0a0a;color:#f2f2f2;' +
    'border:1px solid #2a2a2a;font:500 0.875rem/1.45 Inter,system-ui,sans-serif}' +
    '.hc-consent p{margin:0;flex:1 1 16rem}' +
    '.hc-consent div{display:flex;gap:8px}' +
    '.hc-consent button{min-height:44px;padding:0 18px;border:1px solid #f2f2f2;background:transparent;color:#f2f2f2;' +
    'font:600 0.875rem Sora,system-ui,sans-serif;cursor:pointer}' +
    '.hc-consent button:hover{background:#f2f2f2;color:#0a0a0a}' +
    '.hc-consent button:focus-visible{outline:2px solid #ff3c00;outline-offset:2px}';

  function show() {
    if (document.querySelector('.hc-consent')) return;
    if (!document.getElementById('hc-consent-css')) {
      var st = document.createElement('style');
      st.id = 'hc-consent-css';
      st.textContent = css;
      document.head.appendChild(st);
    }
    var box = document.createElement('div');
    box.className = 'hc-consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', T.label);
    box.innerHTML = '<p>' + T.text + '</p><div><button type="button" data-v="denied">' + T.no + '</button><button type="button" data-v="granted">' + T.yes + '</button></div>';
    box.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-v');
      if (!v) return;
      set(v);
      box.remove();
      if (v === 'granted') loadGA();
      else if (loaded) location.reload(); // withdrawing consent: reload without Analytics
    });
    document.body.appendChild(box);
  }

  function init() {
    var c = get();
    if (c === 'granted') loadGA();
    else if (c !== 'denied') show();
    document.querySelectorAll('[data-cookies]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); show(); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
