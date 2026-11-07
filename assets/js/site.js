(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 导航：滚动后加分隔线 ---------- */

  var nav = $('.nav');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 移动端抽屉 ---------- */

  var toggle = $('.nav__toggle');
  var drawer = $('#drawer');

  function setDrawer(open) {
    if (!drawer || !toggle) return;
    drawer.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      setDrawer(drawer.hidden);
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setDrawer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !drawer.hidden) setDrawer(false);
    });
  }

  /* ---------- 滚动入场 ---------- */

  var items = $$('[data-reveal]');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Hero：桌面 / 手机 截图切换 ---------- */

  var tabs = $$('.hero__switch button');
  var panels = $$('.hero__panel');

  function showPanel(name) {
    panels.forEach(function (p) {
      p.hidden = p.getAttribute('data-panel') !== name;
    });
    tabs.forEach(function (t) {
      t.setAttribute('aria-selected', String(t.getAttribute('data-panel') === name));
      t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1;
    });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showPanel(t.getAttribute('data-panel')); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      showPanel(next.getAttribute('data-panel'));
    });
  });

  /* 手机屏默认看手机截图 */
  if (window.matchMedia('(max-width: 760px)').matches && tabs.length) {
    showPanel('mobile');
  }


  /* ---------- 下载状态 ---------- */

  var dlBtns = $$('[data-dl]');
  var pending = $('#dl-pending');
  var ready = cfg.desktop && cfg.desktop.url;

  dlBtns.forEach(function (btn) {
    if (ready) {
      btn.href = cfg.desktop.url;
      btn.setAttribute('download', '');
    } else {
      btn.href = '#download';
      btn.setAttribute('data-state', 'pending');
      btn.textContent = '下载地址准备中';
      if (pending) pending.classList.add('is-on');
    }
  });

  /* 版本 / 大小 / 校验值 / 链接 */
  $$('[data-fill="version"]').forEach(function (el) { el.textContent = 'v' + (cfg.version || '—'); });
  /* 注意字段名是 sizeLabel，不是 size——写错了会永远显示「—」 */
  $$('[data-fill="size"]').forEach(function (el) { el.textContent = (cfg.desktop && cfg.desktop.sizeLabel) || '—'; });
  $$('[data-fill="system"]').forEach(function (el) { el.textContent = (cfg.desktop && cfg.desktop.minSystem) || '—'; });
  $$('[data-fill="datadir"]').forEach(function (el) { el.textContent = (cfg.desktop && cfg.desktop.dataDir) || '—'; });
  $$('[data-fill="repo"]').forEach(function (el) {
    if (cfg.repoUrl) { el.href = cfg.repoUrl; } else { el.href = '#'; el.setAttribute('aria-disabled', 'true'); }
  });
  $$('[data-fill="issues"]').forEach(function (el) {
    if (cfg.issuesUrl) { el.href = cfg.issuesUrl; } else { el.href = '#'; el.setAttribute('aria-disabled', 'true'); }
  });
  $$('[data-fill="license"]').forEach(function (el) {
    if (cfg.repoUrl) { el.href = cfg.repoUrl + '/blob/main/LICENSE'; }
    else { el.href = '#'; el.setAttribute('aria-disabled', 'true'); }
  });
  $$('[data-fill="mobile"]').forEach(function (el) {
    el.href = (cfg.mobile && cfg.mobile.url) || '#';
    el.textContent = (cfg.mobile && cfg.mobile.label) || '在手机上打开';
  });
  $$('[data-fill="mobile-url"]').forEach(function (el) {
    el.textContent = (cfg.mobile && cfg.mobile.url) || '—';
  });

  /* SHA256 行：没值就整行不渲染 */
  var shaRow = $('#dl-sha');
  var shaVal = $('#dl-sha-value');
  if (shaRow && shaVal) {
    if (cfg.desktop && cfg.desktop.sha256) {
      shaVal.textContent = cfg.desktop.sha256.slice(0, 16) + '…';
      shaVal.setAttribute('title', cfg.desktop.sha256);
      shaVal.setAttribute('data-copy', cfg.desktop.sha256);
    } else {
      shaRow.hidden = true;
    }
  }

  /* ---------- 复制 ---------- */

  function copy(text, btn) {
    var done = function () {
      if (!btn) return;
      var old = btn.getAttribute('data-old') || btn.textContent;
      btn.setAttribute('data-old', old);
      btn.textContent = '已复制';
      setTimeout(function () { btn.textContent = old; }, 1500);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
    } else {
      fallback(text, done);
    }
  }

  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  $$('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function () {
      copy(el.getAttribute('data-copy'), el);
    });
  });

  /* ---------- AI 示例问句：点一下复制 ---------- */

  $$('.chips button').forEach(function (b) {
    b.addEventListener('click', function () {
      copy(b.textContent.trim(), b);
      b.classList.add('is-done');
      setTimeout(function () { b.classList.remove('is-done'); }, 1500);
    });
  });

  /* ---------- 年份 ---------- */

  $$('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- 首条 FAQ 默认展开 ---------- */

  var firstFaq = $('.faq details');
  if (firstFaq) firstFaq.open = true;
})();
