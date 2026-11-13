/* Associação Clube da Família — interações do site */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu mobile ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var menu = document.getElementById('menu-mobile');
  if (menuBtn && menu) {
    var icOpen = menuBtn.querySelector('.ic-open');
    var icClose = menuBtn.querySelector('.ic-close');
    var setMenu = function (open) {
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      if (icOpen) icOpen.style.display = open ? 'none' : 'inline-flex';
      if (icClose) icClose.style.display = open ? 'inline-flex' : 'none';
    };
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) setMenu(false); });
  }

  /* ---------- Contador animado ---------- */
  var stats = document.getElementById('stats');
  if (stats && 'IntersectionObserver' in window && !reduceMotion) {
    var nums = stats.querySelectorAll('[data-count]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.disconnect();
        var start = performance.now(), dur = 1400;
        var step = function (now) {
          var p = Math.min(1, (now - start) / dur), t = 1 - Math.pow(1 - p, 3);
          nums.forEach(function (n) {
            var a = +n.dataset.from, b = +n.dataset.count;
            n.textContent = Math.round(a + (b - a) * t);
          });
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    io.observe(stats);
  }

  /* ---------- Galeria: filtros + lightbox ---------- */
  var gallery = document.getElementById('gallery');
  if (gallery) {
    var tiles = Array.prototype.slice.call(gallery.querySelectorAll('.tile'));
    var countEl = document.getElementById('photo-count');
    var filterBtns = document.querySelectorAll('.filter-btn');
    var ON = 'background: #1E2A5A; color: #ffffff; border: 1.5px solid #1E2A5A; font-weight: 700';
    var OFF = 'background: #ffffff; color: #1E2A5A; border: 1.5px solid #DCE4FB; font-weight: 600';
    var BASE = 'display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px; border-radius: 999px; font-family: inherit; font-size: 15px; cursor: pointer; ';
    var visible = function () { return tiles.filter(function (t) { return t.style.display !== 'none'; }); };

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.dataset.filter;
        filterBtns.forEach(function (b) {
          var on = b === btn;
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          b.setAttribute('style', BASE + (on ? ON : OFF));
        });
        tiles.forEach(function (t) { t.style.display = (f === 'todos' || t.dataset.cat === f) ? '' : 'none'; });
        var n = visible().length;
        if (countEl) countEl.textContent = n + (n === 1 ? ' foto' : ' fotos');
      });
    });

    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lb-img');
    var lbCap = document.getElementById('lb-caption');
    var lbCat = document.getElementById('lb-cat');
    var lbCount = document.getElementById('lb-counter');
    var current = 0, lastFocus = null;

    var show = function (i) {
      var list = visible();
      if (!list.length) return;
      current = (i + list.length) % list.length;
      var t = list[current];
      lbImg.src = t.dataset.src;
      lbImg.alt = t.dataset.caption;
      lbCap.textContent = t.dataset.caption;
      lbCat.textContent = t.dataset.label;
      lbCount.textContent = (current + 1) + ' / ' + list.length;
    };
    var open = function (i) {
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      lb.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      document.getElementById('lb-close').focus();
    };
    var close = function () {
      lb.hidden = true;
      lb.style.display = 'none';
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };
    lb.style.display = 'none';
    tiles.forEach(function (t) {
      t.addEventListener('click', function () { open(visible().indexOf(t)); });
    });
    document.getElementById('lb-close').addEventListener('click', close);
    document.getElementById('lb-prev').addEventListener('click', function () { show(current - 1); });
    document.getElementById('lb-next').addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- Copiar chave PIX ---------- */
  var copyBtn = document.getElementById('copy-pix');
  if (copyBtn) {
    var label = document.getElementById('copy-label');
    copyBtn.addEventListener('click', function () {
      var key = copyBtn.dataset.key;
      var done = function () {
        label.textContent = 'Chave copiada!';
        setTimeout(function () { label.textContent = 'Copiar chave PIX'; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(key).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = key; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(ta); done();
      }
    });
  }

  /* ---------- Formulário de contato ----------
     Versão de aprovação: mostra a confirmação na tela.
     Para envio real, ligar a um serviço de formulários (ex.: Formspree) ou ao e-mail da ONG. */
  var form = document.getElementById('contact-form');
  var sent = document.getElementById('form-sent');
  if (form && sent) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.hidden = true; form.style.display = 'none';
      sent.hidden = false; sent.style.display = 'flex';
    });
    var reset = document.getElementById('form-reset');
    if (reset) reset.addEventListener('click', function () {
      form.reset();
      sent.hidden = true; sent.style.display = 'none';
      form.hidden = false; form.style.display = 'flex';
    });
  }
})();
