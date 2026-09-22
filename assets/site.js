/* ============================================================
   SARA CORPORATION — shared behaviour
   No dependencies. Everything degrades gracefully without JS.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Fires once the page is actually visible (preloader gone). Anything that
     must be *seen* animating — hero counters — waits for this. */
  var readyFired = false;
  function siteReady() {
    if (readyFired) return;
    readyFired = true;
    document.dispatchEvent(new CustomEvent('sara:ready'));
  }
  function onReady(fn) {
    if (readyFired) fn();
    else document.addEventListener('sara:ready', fn, { once: true });
  }

  /* ---------- preloader ---------- */
  (function preloader() {
    var pl = $('#preload');
    if (!pl) { siteReady(); return; }
    var bar = $('.pl-bar i', pl);
    var pct = 0, started = Date.now();

    var tick = setInterval(function () {
      pct = Math.min(pct + Math.random() * 16, 92);
      if (bar) bar.style.width = pct + '%';
    }, 160);

    function finish() {
      clearInterval(tick);
      if (bar) bar.style.width = '100%';
      var wait = Math.max(0, 420 - (Date.now() - started));
      setTimeout(function () {
        pl.classList.add('done');
        document.body.classList.remove('lock');
        siteReady();
        setTimeout(function () { pl.remove(); }, 700);
      }, wait);
    }

    /* waiting for window load meant waiting for every image on the page, which
       pushed first paint past five seconds on a phone. The DOM being ready is
       enough: the hero is preloaded and the rest streams in behind the fold. */
    if (document.readyState !== 'loading') finish();
    else document.addEventListener('DOMContentLoaded', finish);
    setTimeout(finish, 3000); // hard safety net
  })();

  /* ---------- header state + scroll progress ---------- */
  var hdr = $('#hdr'), toTop = $('#totop'), prog = $('#progress'), ticking = false, stuck = false;
  function onScroll() {
    var y = window.pageYOffset;
    /* hysteresis: sticks at 70, releases at 20. A single threshold makes the
       header flip-flop (and re-run the shrink animation) when the user hovers
       right on the boundary or a trackpad bounces. */
    if (hdr) {
      var next = stuck ? y > 20 : y > 70;
      if (next !== stuck) { stuck = next; hdr.classList.toggle('stuck', stuck); }
    }
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
  (function counters() {
    var all = $$('[data-count]');
    if (!all.length) return;

    var DUR = 1500;
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function run(el) {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      var end = parseFloat(el.dataset.count),
          suf = el.dataset.suffix || '',
          t0 = performance.now();
      if (still) { el.textContent = end + suf; return; }
      (function step(t) {
        var p = Math.min((t - t0) / DUR, 1),
            e2 = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e2) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }

    /* Hero strip is above the fold, so an observer would fire behind the
       preloader and the count would be over before anyone saw it. Zero it
       now and run it the moment the page is revealed. */
    var hero = all.filter(function (el) { return el.closest('.hero-strip'); });
    hero.forEach(function (el) { el.textContent = '0' + (el.dataset.suffix || ''); });
    if (hero.length) onReady(function () { hero.forEach(run); });

    var rest = all.filter(function (el) { return hero.indexOf(el) === -1; });
    if (!rest.length) return;
    if (!('IntersectionObserver' in window)) { rest.forEach(run); return; }
    var cio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        run(e.target);
      });
    }, { threshold: .5 });
    rest.forEach(function (el) { cio.observe(el); });
  })();

  /* ---------- hero slideshow ---------- */
  (function heroSlides() {
    var shots = $$('.hero-media .shot');
    if (shots.length < 2) return;

    /* frames after the first are pure decoration, so they stay unrequested
       until the page is painted and interactive */
    onReady(function () {
      shots.forEach(function (el) {
        var bg = el.getAttribute('data-bg');
        if (!bg) return;
        el.setAttribute('style', bg);
        el.removeAttribute('data-bg');
      });
    });
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
        drag = null, pinch = null, lastFocus = null,
        dragMoved = false, lastPanEnd = 0;

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
      /* measured from the untransformed layout box, so the clamp matches the
         scale we are about to paint instead of the one still on screen */
      var w = img.offsetWidth * scale,
          h = img.offsetHeight * scale,
          maxX = Math.max(0, (w - stage.clientWidth) / 2),
          maxY = Math.max(0, (h - stage.clientHeight) / 2);
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
      var k = scale / old;
      if (scale === MIN) { tx = ty = 0; }
      else {
        if (cx !== undefined) {
          var r = stage.getBoundingClientRect(),
              ox = cx - r.left - r.width / 2,
              oy = cy - r.top - r.height / 2;
          tx = ox - (ox - tx) * k;
          ty = oy - (oy - ty) * k;
        } else {
          /* button zoom keeps the same point centred instead of leaving a stale pan */
          tx *= k; ty *= k;
        }
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
      if (e.target.closest('.lb-close')) return close();
      /* pointer capture retargets the click to the stage, so a pan must not close the lightbox */
      if ((e.target === lb || e.target === stage) && Date.now() - lastPanEnd > 300) return close();
      if (e.target === lb || e.target === stage) return;
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
      e.preventDefault();
      drag = { x: e.clientX - tx, y: e.clientY - ty, sx: e.clientX, sy: e.clientY };
      dragMoved = false;
      stage.classList.add('grabbing');
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      if (Math.abs(e.clientX - drag.sx) > 3 || Math.abs(e.clientY - drag.sy) > 3) dragMoved = true;
      tx = e.clientX - drag.x; ty = e.clientY - drag.y;
      clampPan(); apply(true);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      stage.addEventListener(ev, function (e) {
        if (!drag) return;
        drag = null;
        stage.classList.remove('grabbing');
        if (dragMoved) { lastPanEnd = Date.now(); dragMoved = false; }
        if (e.pointerId !== undefined && stage.hasPointerCapture && stage.hasPointerCapture(e.pointerId)) {
          stage.releasePointerCapture(e.pointerId);
        }
      });
    });

    /* native image drag would tear the picture out of the stage mid pan */
    img.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* a resize while zoomed must not leave the picture parked off screen */
    window.addEventListener('resize', function () {
      if (!lb.classList.contains('open') || scale <= 1) return;
      clampPan(); apply(true);
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

  /* ============================================================
     CONTACT FORM — live validation, animated states, async send
     Without JS the form still posts the classic way to FormSubmit.
     ============================================================ */
  (function contactForm() {
    var form = $('[data-form]');
    if (!form) return;

    var alertBox = $('.falert'),
        alertText = $('.falert-text'),
        done = $('.fdone'),
        btn = $('button[type=submit]', form),
        endpoint = form.getAttribute('data-endpoint') || form.action,
        EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
        sending = false;

    var rules = {
      name: { min: 2, msg: 'Please tell us your name.' },
      email: {
        test: function (v) { return EMAIL.test(v); },
        msg: 'Enter a valid email address, like you@company.com.'
      },
      country: { min: 2, msg: 'Let us know which country you ship to.' },
      product: { min: 2, msg: 'Tell us which product you are asking about.' },
      message: { min: 15, msg: 'A line about fabric, quantity or delivery helps us quote properly.' },
      link: {
        optional: true,
        test: function (v) { return /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(v); },
        msg: 'Paste a full link, starting with https://'
      }
    };

    var MAX_FILE = 10 * 1024 * 1024;   /* FormSubmit refuses anything past 10MB */

    var TICK = '<svg viewBox="0 0 24 24"><path d="M4.5 12.5l5 5 10-10"/></svg>',
        CROSS = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>',
        WARN = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16.5v.01"/></svg>';

    /* JS owns the messaging now, so the native bubbles stay out of the way */
    form.setAttribute('novalidate', 'novalidate');

    /* each controlled input gets a wrapper, a status mark and a message slot */
    var controls = $$('[data-rule]', form).map(function (el) {
      var field = el.closest('.field'),
          wrap = document.createElement('span');
      wrap.className = 'fwrap' + (el.tagName === 'TEXTAREA' ? ' has-area' : '');
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);

      var mark = document.createElement('span');
      mark.className = 'fmark';
      mark.setAttribute('aria-hidden', 'true');
      wrap.appendChild(mark);

      var msg = document.createElement('span');
      msg.className = 'fmsg';
      msg.innerHTML = '<span></span>';
      field.appendChild(msg);

      var id = el.id || el.name;
      msg.firstChild.id = id + '-msg';
      el.setAttribute('aria-describedby', id + '-msg');

      return {
        el: el, field: field, mark: mark, msg: msg.firstChild,
        rule: rules[el.getAttribute('data-rule')], touched: false
      };
    });

    function errorOf(c) {
      var v = c.el.value.trim(), r = c.rule || {};
      if (!v) return r.optional ? '' : 'This field is required.';
      if (r.test && !r.test(v)) return r.msg;
      if (r.min && v.length < r.min) return r.msg;
      return '';
    }

    function paint(c, err, shake) {
      c.field.classList.toggle('bad', !!err);
      c.field.classList.toggle('ok', !err);
      c.el.setAttribute('aria-invalid', err ? 'true' : 'false');
      c.mark.innerHTML = err ? CROSS : TICK;
      c.msg.innerHTML = err ? WARN + '<span>' + err + '</span>' : '';
      if (err && shake) {
        c.field.classList.remove('shake');
        void c.field.offsetWidth;          /* restart the shake even on a repeat miss */
        c.field.classList.add('shake');
        setTimeout(function () { c.field.classList.remove('shake'); }, 550);
      }
    }

    function clear(c) {
      c.field.classList.remove('bad', 'ok', 'shake');
      c.mark.innerHTML = '';
      c.msg.innerHTML = '';
      c.el.removeAttribute('aria-invalid');
    }

    function check(c, shake) {
      var err = errorOf(c);
      if (!c.el.value.trim() && (c.rule || {}).optional) { clear(c); return ''; }
      if (!c.touched && !c.el.value.trim()) { clear(c); return err; }
      paint(c, err, shake);
      return err;
    }

    controls.forEach(function (c) {
      c.el.addEventListener('blur', function () { c.touched = true; check(c, false); });
      c.el.addEventListener('input', function () {
        hideAlert();
        if (c.touched || c.field.classList.contains('bad')) check(c, false);
      });
    });

    /* ---- tech pack: a link or a file, never both at once ---- */
    var tp = $('[data-techpack]', form),
        fileIn = tp && $('.tp-file', tp),
        linkIn = tp && $('[data-rule=link]', tp),
        drop = tp && $('.tp-drop', tp),
        tpName = tp && $('[data-tp-name]', tp),
        tpHint = tp && $('[data-tp-hint]', tp),
        tpExt = tp && $('[data-tp-ext]', tp),
        meter = tp && $('[data-tp-meter]', tp),
        meterBar = tp && $('[data-tp-meter] i', tp),
        meterTxt = tp && $('[data-tp-meter-text]', tp),
        switchBtn = tp && $('[data-tp-switch]', tp),
        tpMode = 'link',
        fileErr = '';

    function setMode(mode) {
      tpMode = mode;
      $$('.tp-tab', tp).forEach(function (b) {
        var on = b.getAttribute('data-tp') === mode;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      $$('.tp-pane', tp).forEach(function (pane) {
        pane.classList.toggle('on', pane.getAttribute('data-tp-pane') === mode);
      });
      /* whichever side is hidden must not travel with the enquiry */
      if (mode === 'link') { clearFile(); }
      else if (linkIn) { linkIn.value = ''; controls.forEach(function (c) { if (c.el === linkIn) clear(c); }); }
    }

    function humanSize(n) {
      return n < 1024 * 1024 ? Math.max(1, Math.round(n / 1024)) + ' KB'
                             : (n / 1024 / 1024).toFixed(1) + ' MB';
    }

    function paintFile() {
      var f = fileIn && fileIn.files && fileIn.files[0];
      fileErr = '';

      if (!f) {
        drop.classList.remove('has', 'bad');
        meter.hidden = true;
        switchBtn.hidden = true;
        return;
      }

      var dot = f.name.lastIndexOf('.');
      tpExt.textContent = dot > -1 ? f.name.slice(dot + 1).toUpperCase().slice(0, 4) : 'FILE';

      /* the meter shows how much of the 10MB allowance the file eats */
      var pct = Math.min(100, Math.round(f.size / MAX_FILE * 100));
      meter.hidden = false;
      meterBar.style.width = pct + '%';
      meter.classList.toggle('over', f.size > MAX_FILE);
      meter.classList.toggle('warn', f.size <= MAX_FILE && pct >= 75);
      meterTxt.textContent = humanSize(f.size) + ' of 10 MB';

      if (f.size > MAX_FILE) {
        fileErr = 'This file is ' + humanSize(f.size) + ', over the 10 MB limit. Send it as a link instead.';
        drop.classList.remove('has');
        drop.classList.add('bad');
        tpName.textContent = f.name;
        tpHint.textContent = fileErr;
        switchBtn.hidden = false;
        return;
      }

      drop.classList.remove('bad');
      drop.classList.add('has');
      switchBtn.hidden = true;
      tpName.textContent = f.name;
      tpHint.textContent = pct >= 75
        ? humanSize(f.size) + ' \u00b7 close to the 10 MB limit, but it will send'
        : humanSize(f.size) + ' \u00b7 attached to your enquiry';
    }

    function clearFile() {
      if (!fileIn) return;
      fileIn.value = '';
      paintFile();
    }

    if (tp) {
      $$('.tp-tab', tp).forEach(function (b) {
        b.addEventListener('click', function () { setMode(b.getAttribute('data-tp')); });
      });
      fileIn.addEventListener('change', function () { hideAlert(); paintFile(); });

      switchBtn.addEventListener('click', function () {
        clearFile();
        setMode('link');
        if (linkIn) linkIn.focus();
      });

      var clearBtn = $('[data-tp-clear]', tp);
      clearBtn.addEventListener('click', function (e) { e.preventDefault(); clearFile(); });
      clearBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clearFile(); }
      });

      drop.addEventListener('pointermove', function (e) {
        var r = drop.getBoundingClientRect();
        drop.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        drop.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });

      ['dragenter', 'dragover'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); });
      });
      drop.addEventListener('drop', function (e) {
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (!f) return;
        var dt = new DataTransfer();
        dt.items.add(f);
        fileIn.files = dt.files;
        paintFile();
      });
    }

    function showAlert(html) {
      if (!alertBox) return;
      alertText.innerHTML = html;
      alertBox.classList.add('show');
    }
    function hideAlert() { if (alertBox) alertBox.classList.remove('show'); }

    function setBtn(state) {
      btn.classList.remove('sending', 'sent', 'error-shake');
      if (state) btn.classList.add(state);
      btn.disabled = state === 'sending';
    }

    function flashBtn() {
      btn.classList.add('error-shake');
      setTimeout(function () { btn.classList.remove('error-shake'); }, 600);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      hideAlert();

      var first = null;
      controls.forEach(function (c) {
        c.touched = true;
        if (check(c, true) && !first) first = c;
      });
      if (first) {
        flashBtn();
        first.el.focus({ preventScroll: true });
        first.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      /* an oversized file would be rejected by the server, so stop here */
      if (tpMode === 'file') {
        paintFile();
        if (fileErr) {
          flashBtn();
          drop.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      /* honeypot: a filled hidden field means a bot, so show success and send nothing */
      var honey = form.querySelector('[name=_honey]');
      if (honey && honey.value) { succeed(); return; }

      /* an attachment cannot ride on the JSON endpoint, so a file posts the
         classic way and lands on the thank you page instead */
      if (tpMode === 'file' && fileIn.files.length) {
        setBtn('sending');
        sending = true;
        form.setAttribute('enctype', 'multipart/form-data');
        var next = form.querySelector('[name=_next]');
        if (!next) {
          next = document.createElement('input');
          next.type = 'hidden';
          next.name = '_next';
          form.appendChild(next);
        }
        next.value = location.origin + '/thank-you.html';
        form.submit();
        return;
      }

      sending = true;
      setBtn('sending');

      var payload = {};
      new FormData(form).forEach(function (v, k) {
        if (k === '_honey' || k === 'attachment') return;   /* a File cannot be serialised */
        payload[k] = v;
      });

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (data) {
            if (!r.ok || String(data.success) === 'false') {
              throw new Error(data.message || 'request failed with status ' + r.status);
            }
            return data;
          });
        })
        .then(function () {
          sending = false;
          setBtn('sent');
          setTimeout(succeed, 560);
        })
        .catch(function (err) {
          sending = false;
          setBtn(null);
          flashBtn();
          showAlert('We could not send that just now (' + (err.message || 'network error') +
            '). Please try again, or email us directly at ' +
            '<a href="mailto:ayaz@saracorporation.com">ayaz@saracorporation.com</a>.');
        });
    });

    function succeed() {
      hideAlert();
      form.style.display = 'none';
      form.reset();
      controls.forEach(function (c) { clear(c); c.touched = false; });
      if (tp) { setMode('link'); paintFile(); }
      setBtn(null);
      if (done) done.classList.add('show');
    }

    var again = $('[data-form-reset]');
    if (again) {
      again.addEventListener('click', function () {
        if (done) done.classList.remove('show');
        form.style.display = '';
        var f = $('[data-rule]', form);
        if (f) f.focus();
      });
    }
  })();

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
