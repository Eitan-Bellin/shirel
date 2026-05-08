/* ═══════════════════════════════════════════════════════════════
   SHIREL COSMETIC — script.js
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Footer year ────────────────────────────────────────────── */
  const yrEl = document.getElementById('yr');
  if (yrEl) yrEl.textContent = new Date().getFullYear();

  /* ── Smooth anchor scroll ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── Nav scroll state ───────────────────────────────────────── */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }
    updateProgress();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Scroll progress bar ────────────────────────────────────── */
  var progressBar = document.getElementById('scroll-progress');
  function updateProgress() {
    if (!progressBar) return;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ── Mobile menu ────────────────────────────────────────────── */
  var hamBtn  = document.getElementById('ham-btn');
  var mobMenu = document.getElementById('mob-menu');
  var mobClose = document.getElementById('mob-close');

  function openMob() {
    if (!mobMenu) return;
    mobMenu.classList.add('open');
    mobMenu.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }
  window.closeMob = function () {
    if (!mobMenu) return;
    mobMenu.classList.remove('open');
    mobMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  if (hamBtn)  hamBtn.addEventListener('click', openMob);
  if (mobClose) mobClose.addEventListener('click', window.closeMob);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.closeMob();
  });

  /* ── IntersectionObserver — reveal ──────────────────────────── */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = el.dataset.delay ? parseFloat(el.dataset.delay) : i * 80;
        setTimeout(function () {
          el.classList.add('visible');
        }, delay);
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  /* Stagger siblings automatically */
  var revealGroups = {};
  document.querySelectorAll('.reveal').forEach(function (el) {
    var parent = el.parentElement;
    if (!revealGroups[parent]) revealGroups[parent] = [];
    var idx = revealGroups[parent].length;
    revealGroups[parent].push(el);
    el.dataset.delay = idx * 100;
    revealObserver.observe(el);
  });

  /* ── Counter animation ───────────────────────────────────────── */
  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10);
        var suffix = el.dataset.suffix || '';
        var duration = 1400;
        var start = performance.now();
        function step(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-count]').forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ── Before / After slider ───────────────────────────────────── */
  var baSlider = document.getElementById('ba-slider');
  var baHandle = document.getElementById('ba-handle');
  var baBefore = baSlider ? baSlider.querySelector('.ba-before') : null;

  if (baSlider && baHandle && baBefore) {
    var dragging = false;

    function setPos(x) {
      var rect = baSlider.getBoundingClientRect();
      var pct  = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
      baHandle.style.left = (pct * 100) + '%';
      /* RTL: before panel clips from left, sits on right side of handle */
      baBefore.style.clipPath = 'inset(0 0 0 ' + (pct * 100) + '%)';
    }

    baSlider.addEventListener('mousedown', function (e) {
      dragging = true;
      setPos(e.clientX);
    });
    window.addEventListener('mousemove', function (e) {
      if (dragging) setPos(e.clientX);
    });
    window.addEventListener('mouseup', function () { dragging = false; });

    baSlider.addEventListener('touchstart', function (e) {
      dragging = true;
      setPos(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (dragging) setPos(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', function () { dragging = false; });

    /* Auto-sweep on entry */
    var swept = false;
    var baObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting && !swept) {
          swept = true;
          autoSweep();
        }
      },
      { threshold: 0.4 }
    );
    baObserver.observe(baSlider);

    function autoSweep() {
      var duration = 1800;
      var start = null;
      /* Start mostly showing "after" (left/colored), sweep to reveal "before" (right/grey) */
      var startPct = 0.78;
      var endPct   = 0.22;

      function animFrame(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
        var pct = startPct + (endPct - startPct) * eased;
        baHandle.style.left = (pct * 100) + '%';
        baBefore.style.clipPath = 'inset(0 0 0 ' + (pct * 100) + '%)';
        if (progress < 1) requestAnimationFrame(animFrame);
      }
      requestAnimationFrame(animFrame);
    }
  }

  /* ── Pricing accordion ───────────────────────────────────────── */
  document.querySelectorAll('[data-acc]').forEach(function (item) {
    var top  = item.querySelector('.price-item-top');
    var body = item.querySelector('.price-item-body');
    if (!top || !body) return;

    top.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      /* Close siblings */
      var siblings = item.parentElement.querySelectorAll('[data-acc].open');
      siblings.forEach(function (s) {
        if (s !== item) s.classList.remove('open');
      });
      item.classList.toggle('open', !isOpen);
    });
  });

  /* ── Logo background removal (Canvas API) ───────────────────── */
  function removeBg(imgEl) {
    if (!imgEl || !imgEl.complete || !imgEl.naturalWidth) return;
    var canvas = document.createElement('canvas');
    canvas.width  = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    var ctx = canvas.getContext('2d');
    try {
      ctx.drawImage(imgEl, 0, 0);
      var id  = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var px  = id.data;
      /* Sample background colour from top-left corner */
      var bgR = px[0], bgG = px[1], bgB = px[2];

      for (var i = 0; i < px.length; i += 4) {
        var dr   = px[i]   - bgR;
        var dg   = px[i+1] - bgG;
        var db   = px[i+2] - bgB;
        var dist = Math.sqrt(dr*dr + dg*dg + db*db);
        if (dist < 58) {
          /* Smooth fade near edges so line-art doesn't get hard-cut */
          px[i+3] = dist < 38 ? 0 : Math.round(((dist - 38) / 20) * 255);
        }
      }
      ctx.putImageData(id, 0, 0);
      imgEl.src = canvas.toDataURL('image/png');
    } catch (e) { /* cross-origin or security error — keep original */ }
  }

  function applyLogoRemoval() {
    removeBg(document.getElementById('nav-logo-img'));
    removeBg(document.getElementById('footer-logo-img'));
  }

  /* Run after images load (they may still be loading when script executes) */
  var navLogoImg = document.getElementById('nav-logo-img');
  if (navLogoImg && navLogoImg.complete) {
    applyLogoRemoval();
  } else if (navLogoImg) {
    navLogoImg.addEventListener('load', applyLogoRemoval);
  }

})();
