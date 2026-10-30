/* Visit counts without cookies (GoatCounter, hache.goatcounter.com), on every page.
   Pages under /ref-NNNN/ and /es/ref-NNNN/ are the links sent in application emails
   (pool in scripts/alias-codes.json, built by scripts/prerender.mjs); they count under their own path.
   On those pages a second event, "leido /es/ref-NNNN/", fires only if someone keeps the tab
   visible for 10 seconds or scrolls: mail scanners open links on delivery but do not stay. */
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

  if (!isRef) return;

  var sent = false;
  function read() {
    if (sent || !window.goatcounter.count) return;
    sent = true;
    clearInterval(timer);
    window.removeEventListener('scroll', onScroll);
    window.goatcounter.count({ path: 'leido ' + location.pathname, title: document.title, event: true });
  }
  function onScroll() {
    if (window.scrollY > 200) read();
  }
  var seconds = 0;
  var timer = setInterval(function () {
    if (document.visibilityState === 'visible' && ++seconds >= 10) read();
  }, 1000);
  window.addEventListener('scroll', onScroll, { passive: true });
})();
