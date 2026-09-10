/* ==========================================================
   nouch LP  —  script
   ========================================================== */
(function () {
  'use strict';

  var dl = (window.dataLayer = window.dataLayer || []);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------
     1. scroll reveal
     ---------------------------------------------------- */
  var revealTargets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------
     2. fit-switch animation  (plays once, on view)
     ---------------------------------------------------- */
  var sw = document.getElementById('switch');
  if (sw) {
    if (reduce || !('IntersectionObserver' in window)) {
      sw.classList.add('is-play');
    } else {
      var swIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            sw.classList.add('is-play');
            swIo.disconnect();
            dl.push({ event: 'view_fit_switch' });
          }
        });
      }, { threshold: 0.55 });
      swIo.observe(sw);
    }
  }

  /* ----------------------------------------------------
     2b. drawer video  (plays once, on view, then stays open)
     ---------------------------------------------------- */
  var drawer = document.getElementById('drawerVideo');
  if (drawer) {
    if (!('IntersectionObserver' in window)) {
      var p0 = drawer.play(); if (p0) p0.catch(function () {});
    } else {
      var dIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var pr = drawer.play();
            if (pr) pr.catch(function () {});
            dIo.disconnect();
            dl.push({ event: 'view_drawer' });
          }
        });
      }, { threshold: 0.4 });
      dIo.observe(drawer);
    }
  }

  /* ----------------------------------------------------
     3. colour swatches
     ---------------------------------------------------- */
  var img = document.getElementById('productImg');
  var swatches = document.querySelectorAll('.swatch');
  var NAME = { mist: 'ミスト', sand: 'サンド', clay: 'クレイ' };

  swatches.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var c = btn.dataset.color;
      if (!img || btn.classList.contains('is-on')) return;

      swatches.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      img.classList.add('is-swap');
      var next = new Image();
      next.onload = function () {
        img.src = next.src;
        img.alt = 'nouch ゴーグル ' + NAME[c];
        img.classList.remove('is-swap');
      };
      next.src = 'assets/img/product-' + c + '.png';

      dl.push({ event: 'select_color', color: c });
    });
  });

  /* ----------------------------------------------------
     4. CTA tracking
     ---------------------------------------------------- */
  document.querySelectorAll('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function () {
      dl.push({ event: 'cta_click', cta_position: a.dataset.cta });
    });
  });

  /* ----------------------------------------------------
     5. FAQ open tracking
     ---------------------------------------------------- */
  document.querySelectorAll('.qa').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) {
        var q = d.querySelector('summary');
        dl.push({ event: 'faq_open', question: q ? q.textContent.trim() : '' });
      }
    });
  });

  /* ----------------------------------------------------
     6. scroll depth  (25 / 50 / 75 / 100)
     ---------------------------------------------------- */
  var marks = [25, 50, 75, 100];
  var fired = {};
  var ticking = false;

  function depth() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (max <= 0) return;
    var pct = ((h.scrollTop || document.body.scrollTop) / max) * 100;
    marks.forEach(function (m) {
      if (!fired[m] && pct >= m) {
        fired[m] = true;
        dl.push({ event: 'scroll_depth', percent: m });
      }
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(depth); }
  }, { passive: true });

  /* ----------------------------------------------------
     7. pause background video when off-screen
        (saves battery on mobile)
     ---------------------------------------------------- */
  var bgVideos = document.querySelectorAll('.solution__bg, .final__bg, .fv__video');
  if ('IntersectionObserver' in window) {
    var vIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.paused) { var p = v.play(); if (p) p.catch(function () {}); }
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.1 });
    bgVideos.forEach(function (v) { vIo.observe(v); });
  }
})();
