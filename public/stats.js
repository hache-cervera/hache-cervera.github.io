/* Visit counts without cookies (GoatCounter, hache.goatcounter.com), on every page.
   Pages under /ref-NNNN/ and /es/ref-NNNN/ are the links sent in application emails
   (pool in scripts/alias-codes.json, built by scripts/prerender.mjs); they count under their own path.

   On those pages a few events tell a person from a scanner, and how far the person went.
   All of them need at least one real input (mouse, touch, wheel or key; script-dispatched events
   have isTrusted false), and none is sent when the browser announces automation (navigator.webdriver).
   Mail scanners and link previews open links but do not stay, and automated browsers that scroll
   or wait do not move a mouse.
     leido <path>       10 visible seconds or a scroll past 200 px
     1-minuto <path>    60 visible seconds
     scroll-50 <path>   half of the page seen
     scroll-100 <path>  the end of the page seen
     clic-<tipo> <path> a click on the CV, LinkedIn, email, research or projects
   The tracking sheet reads the word before the space, so keep that format. */
(function () {
  var isRef = document.documentElement.hasAttribute('data-ref');
  window.goatcounter = { endpoint: 'https://hache.goatcounter.com/count' };
  // count.js takes the path from <link rel="canonical"> when there is one. Reference pages
  // point their canonical at the home, so without this every visit would count as "/".
  if (isRef) window.goatcounter.path = function () { return location.pathname.replace(/\/$/, ''); };

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', window.goatcounter.endpoint);
  document.head.appendChild(s);

  if (!isRef || navigator.webdriver) return;

  var human = false;
  var seconds = 0;
  var sent = {};
  var queue = [];

  // Sends each event once. Events raised before count.js has loaded wait in the queue.
  function send(name) {
    if (sent[name] || !human) return;
    if (!window.goatcounter.count) { if (queue.indexOf(name) === -1) queue.push(name); return; }
    sent[name] = true;
    window.goatcounter.count({ path: name + ' ' + location.pathname, title: document.title, event: true });
  }
  function flush() {
    var q = queue; queue = [];
    q.forEach(send);
  }

  function depth() {
    var seen = (window.scrollY + window.innerHeight) / Math.max(document.documentElement.scrollHeight, 1);
    if (window.scrollY > 200) send('leido');
    if (seen >= 0.5) send('scroll-50');
    if (seen >= 0.97) send('scroll-100');
  }

  function check() {
    if (seconds >= 10) send('leido');
    if (seconds >= 60) send('1-minuto');
    depth();
    flush();
  }

  // A real input from the visitor.
  function onInput(e) {
    if (!e.isTrusted) return;
    human = true;
    check();
  }
  ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (t) {
    window.addEventListener(t, onInput, { passive: true });
  });

  setInterval(function () {
    if (document.visibilityState === 'visible') seconds++;
    if (human) check();
  }, 1000);
  window.addEventListener('scroll', function () { if (human) depth(); }, { passive: true });

  // Clicks that matter. Research and project pages count under their own paths, so without
  // this event a click from a reference page would not be tied to the company that got it.
  function kind(href) {
    if (/(^|\/)cv\/.*\.pdf$/i.test(href)) return 'cv';
    if (/linkedin\.com/i.test(href)) return 'linkedin';
    if (/^mailto:/i.test(href)) return 'email';
    if (/(^|\/)research\//.test(href)) return 'investigacion';
    if (/(^|\/)work\/|github\.com|npmjs\.com|devilfruittcg\.com/i.test(href)) return 'proyectos';
    return '';
  }
  function onClick(e) {
    if (!e.isTrusted) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var k = kind(a.getAttribute('href') || '');
    if (!k) return;
    human = true;
    send('clic-' + k);
  }
  document.addEventListener('click', onClick, true);
  document.addEventListener('auxclick', onClick, true);
})();
