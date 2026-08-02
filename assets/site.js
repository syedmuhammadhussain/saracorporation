/* ============================================================
   SARA CORPORATION — shared behaviour
   No dependencies. Everything degrades gracefully without JS.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- preloader ---------- */
  (function preloader() {
    var pl = $('#preload');
    if (!pl) return;
    var bar = $('.pl-bar i', pl);
    var pct = 0, started = Date.now();

    var tick = setInterval(function () {
      pct = Math.min(pct + Math.random() * 16, 92);
      if (bar) bar.style.width = pct + '%';
    }, 160);

    function finish() {
      clearInterval(tick);
      if (bar) bar.style.width = '100%';
      var wait = Math.max(0, 650 - (Date.now() - started));
      setTimeout(function () {
        pl.classList.add('done');
        document.body.classList.remove('lock');
        setTimeout(function () { pl.remove(); }, 700);
      }, wait);
    }

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish);
    setTimeout(finish, 6000); // hard safety net
  })();

  /* ---------- header state + scroll progress ---------- */
  var hdr = $('#hdr'), toTop = $('#totop'), prog = $('#progress'), ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (hdr) hdr.classList.toggle('stuck', y > 40);
    if (toTop) toTop.classList.toggle('on', y > 640);
    if (prog && !ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
        ticking = false;
      });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- mobile menu ---------- */
  var burger = $('#burger'), menu = $('#menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('open');
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- dropdown menus ---------- */
  (function drops() {
    var items = $$('.has-drop');
    if (!items.length) return;
    function closeAll(except) {
      items.forEach(function (it) {
        if (it !== except) {
          it.classList.remove('open');
          var t = $('.drop-toggle', it);
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
    }
    items.forEach(function (it) {
      var toggle = $('.drop-toggle', it);
      if (!toggle) return;
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        var open = !it.classList.contains('open');
        closeAll(it);
        it.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open);
      });
      it.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { it.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.has-drop')) closeAll(null);
    });
  })();

  /* ---------- reveal on scroll (with stagger groups) ---------- */
  var rvs = $$('.rv, [data-stagger]');
  if (rvs.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          if (el.hasAttribute('data-stagger')) {
            var step = parseInt(el.getAttribute('data-stagger'), 10) || 90;
            Array.prototype.forEach.call(el.children, function (c, i) {
              c.style.transitionDelay = (i * step) + 'ms';
            });
          }
          el.classList.add('in');
          io.unobserve(el);
        });
      }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
      rvs.forEach(function (el) { io.observe(el); });
    } else rvs.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- page-head parallax ---------- */
  (function parallax() {
    var bg = $('.page-head .bg');
    if (!bg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var raf = false;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = true;
      requestAnimationFrame(function () {
        var y = window.pageYOffset;
        if (y < 900) bg.style.transform = 'translate3d(0,' + (y * 0.28) + 'px,0) scale(1.12)';
        raf = false;
      });
    }, { passive: true });
  })();

  /* ---------- animated counters ---------- */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target,
            end = parseFloat(el.dataset.count),
            suf = el.dataset.suffix || '',
            dur = 1500, t0 = performance.now();
        (function step(t) {
          var p = Math.min((t - t0) / dur, 1),
              e2 = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * e2) + suf;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- hero slideshow ---------- */
  (function heroSlides() {
    var shots = $$('.hero-media .shot');
    if (shots.length < 2) return;
    var dots = $$('.hero-dots button'), i = 0, timer;

    function go(n) {
      shots[i].classList.remove('on');
      if (dots[i]) dots[i].classList.remove('on');
      i = (n + shots.length) % shots.length;
      shots[i].classList.add('on');
      if (dots[i]) dots[i].classList.add('on');
    }
    function play() { timer = setInterval(function () { go(i + 1); }, 6000); }
    function reset() { clearInterval(timer); play(); }

    dots.forEach(function (d, n) { d.addEventListener('click', function () { go(n); reset(); }); });
    play();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearInterval(timer); else reset();
    });
  })();

  /* ---------- product filter ---------- */
  (function filters() {
    var btns = $$('.fbtn');
    if (!btns.length) return;
    var cards = $$('.pcard');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var f = b.dataset.f;
        cards.forEach(function (c) { c.classList.toggle('hide', f !== 'all' && c.dataset.c !== f); });
        if (window.SaraLightbox) window.SaraLightbox.refresh();
      });
    });
  })();

  /* ============================================================
     VIDEO MODAL — YouTube facade (iframe only injected on click,
     so the page costs nothing until the user asks for the video)
     ============================================================ */
  (function video() {
    var modal = $('#vmodal');
    if (!modal) return;
    var box = $('.modal-video', modal),
        id = modal.dataset.yt,
        lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&rel=0&modestbranding=1" title="Sara Corporation company video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      modal.classList.add('open');
      document.body.classList.add('lock');
      requestAnimationFrame(function () { modal.classList.add('shown'); });
      var c = $('.modal-close', modal); if (c) c.focus();
    }
    function close() {
      modal.classList.remove('shown');
      document.body.classList.remove('lock');
      setTimeout(function () { modal.classList.remove('open'); box.innerHTML = ''; }, 280);
      if (lastFocus) lastFocus.focus();
    }

    $$('[data-video]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('.modal-close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  })();

  /* ============================================================
     LIGHTBOX — gallery with zoom / pan / keyboard / pinch
     Any element with [data-lb] joins the gallery.
       data-lb      = full size image url
       data-lb-title= caption
     ============================================================ */
  (function lightbox() {
    var lb = $('#lightbox');
    if (!lb) return;

    var stage = $('.lb-stage', lb),
        img = $('.lb-stage img', lb),
        tEl = $('.lb-title b', lb),
        cEl = $('.lb-title span', lb),
        zEl = $('.lb-zoomval', lb),
        prevB = $('.lb-prev', lb),
        nextB = $('.lb-next', lb),
        items = [], idx = 0,
        scale = 1, tx = 0, ty = 0,
        MIN = 1, MAX = 5,
        drag = null, pinch = null, lastFocus = null;

    function collect() { items = $$('[data-lb]').filter(function (el) { return !el.classList.contains('hide'); }); }
    collect();

    function apply(instant) {
      img.classList.toggle('zoomed', !!instant);
      img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
      if (zEl) zEl.textContent = Math.round(scale * 100) + '%';
      stage.style.cursor = scale > 1 ? 'grab' : 'default';
    }
    function resetZoom() { scale = 1; tx = ty = 0; apply(false); }

    function clampPan() {
      var r = img.getBoundingClientRect(),
          maxX = Math.max(0, (r.width - stage.clientWidth) / 2 + 40),
          maxY = Math.max(0, (r.height - stage.clientHeight) / 2 + 40);
      tx = Math.max(-maxX, Math.min(maxX, tx));
      ty = Math.max(-maxY, Math.min(maxY, ty));
    }

    function show(n) {
      if (!items.length) return;
      idx = (n + items.length) % items.length;
      var el = items[idx];
      img.src = el.dataset.lb;
      img.alt = el.dataset.lbTitle || '';
      if (tEl) tEl.textContent = el.dataset.lbTitle || '';
      if (cEl) cEl.textContent = (idx + 1) + ' of ' + items.length;
      resetZoom();
      var multi = items.length > 1;
      if (prevB) prevB.style.display = multi ? '' : 'none';
      if (nextB) nextB.style.display = multi ? '' : 'none';
    }

    function open(el) {
      collect();
      var n = items.indexOf(el);
      lastFocus = document.activeElement;
      show(n < 0 ? 0 : n);
      lb.classList.add('open');
      document.body.classList.add('lock');
      requestAnimationFrame(function () { lb.classList.add('shown'); });
      var c = $('.lb-close', lb); if (c) c.focus();
    }
    function close() {
      lb.classList.remove('shown');
      document.body.classList.remove('lock');
      setTimeout(function () { lb.classList.remove('open'); img.removeAttribute('src'); }, 260);
      if (lastFocus) lastFocus.focus();
    }

    function zoomAt(factor, cx, cy) {
      var old = scale;
      scale = Math.max(MIN, Math.min(MAX, scale * factor));
      if (scale === old) return;
      if (scale === MIN) { tx = ty = 0; }
      else if (cx !== undefined) {
        var r = stage.getBoundingClientRect(),
            ox = cx - r.left - r.width / 2,
            oy = cy - r.top - r.height / 2,
            k = scale / old;
        tx = ox - (ox - tx) * k;
        ty = oy - (oy - ty) * k;
        clampPan();
      }
      apply(true);
    }

    /* open triggers */
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-lb]');
      if (!t) return;
      e.preventDefault();
      open(t);
    });

    /* controls */
    lb.addEventListener('click', function (e) {
      if (e.target.closest('.lb-close') || e.target === lb || e.target === stage) return close();
      if (e.target.closest('.lb-prev')) return show(idx - 1);
      if (e.target.closest('.lb-next')) return show(idx + 1);
      if (e.target.closest('.lb-in')) return zoomAt(1.4);
      if (e.target.closest('.lb-out')) return zoomAt(1 / 1.4);
      if (e.target.closest('.lb-reset')) return resetZoom();
    });

    /* wheel zoom */
    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.16 : 1 / 1.16, e.clientX, e.clientY);
    }, { passive: false });

    /* double click / double tap toggle */
    img.addEventListener('dblclick', function (e) {
      e.preventDefault();
      if (scale > 1) resetZoom(); else zoomAt(2.4, e.clientX, e.clientY);
    });

    /* drag pan */
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' && pinch) return;
      if (scale <= 1) return;
      drag = { x: e.clientX - tx, y: e.clientY - ty };
      stage.classList.add('grabbing');
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      tx = e.clientX - drag.x; ty = e.clientY - drag.y;
      clampPan(); apply(true);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      stage.addEventListener(ev, function () { drag = null; stage.classList.remove('grabbing'); });
    });

    /* pinch zoom */
    var touches = {};
    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        var a = e.touches[0], b = e.touches[1];
        pinch = { d: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY), s: scale };
      }
    }, { passive: true });
    stage.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2 && pinch) {
        e.preventDefault();
        var a = e.touches[0], b = e.touches[1],
            d = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        scale = Math.max(MIN, Math.min(MAX, pinch.s * (d / pinch.d)));
        if (scale === MIN) tx = ty = 0; else clampPan();
        apply(true);
      }
    }, { passive: false });
    stage.addEventListener('touchend', function (e) { if (e.touches.length < 2) pinch = null; }, { passive: true });

    /* swipe to change image when not zoomed */
    var sw = null;
    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1 && scale === 1) sw = { x: e.touches[0].clientX, t: Date.now() };
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (!sw || scale !== 1) { sw = null; return; }
      var dx = (e.changedTouches[0].clientX - sw.x);
      if (Math.abs(dx) > 60 && Date.now() - sw.t < 700) show(idx + (dx < 0 ? 1 : -1));
      sw = null;
    }, { passive: true });

    /* keyboard */
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === '+' || e.key === '=') zoomAt(1.4);
      else if (e.key === '-') zoomAt(1 / 1.4);
      else if (e.key === '0') resetZoom();
    });

    window.SaraLightbox = { refresh: collect };
  })();

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
