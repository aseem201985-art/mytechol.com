/* ============================================================
   CODEHUB — App logic
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Theme ---------- */
  const ROOT = document.documentElement;
  const THEME_KEY = 'codehub-theme';

  function applyTheme(t) {
    ROOT.setAttribute('data-theme', t);
    localStorage.setItem(THEME_KEY, t);
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
      el.innerHTML = t === 'dark'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    });
  }

  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));

  document.addEventListener('click', e => {
    const tog = e.target.closest('[data-theme-toggle]');
    if (tog) {
      applyTheme(ROOT.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    }
  });

  /* ---------- Nav scroll state ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile drawer ---------- */
  const burger = document.querySelector('[data-burger]');
  const drawer = document.querySelector('[data-drawer]');
  if (burger && drawer) {
    const toggleDrawer = (on) => {
      drawer.classList.toggle('open', on);
      document.body.style.overflow = on ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggleDrawer(true));
    drawer.querySelector('[data-close]')?.addEventListener('click', () => toggleDrawer(false));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleDrawer(false)));
  }

  /* ---------- Active nav link ---------- */
  const path = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  document.querySelectorAll('.nav__links a, .drawer a').forEach(a => {
    const href = (a.getAttribute('href') || '').replace(/\.html$/, '');
    if (!href || href.startsWith('#')) return;
    const clean = href.replace(/\/index\.html$/, '/');
    if (clean === '/' ? (path === '/' || path === '/index') : path.startsWith(clean.replace(/\/$/, ''))) {
      a.classList.add('active');
    }
  });

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  function observeReveals() {
    document.querySelectorAll('.reveal:not(.in)').forEach((el, i) => {
      el.style.transitionDelay = (Math.min(i, 6) * 70) + 'ms';
      io.observe(el);
    });
  }

  /* ---------- Spotlight on cards ---------- */
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.aud-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });

  /* ---------- Copy code ---------- */
  document.addEventListener('click', async e => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const pre = btn.closest('.code-wrap')?.querySelector('pre');
    if (!pre) return;
    try {
      await navigator.clipboard.writeText(pre.innerText);
      const old = btn.textContent;
      btn.textContent = 'تم النسخ ✓';
      btn.style.background = 'var(--brand-1)';
      setTimeout(() => { btn.textContent = old; btn.style.background = ''; }, 1600);
    } catch (_) {}
  });

  /* ---------- Filters ---------- */
  function initFilters() {
    document.querySelectorAll('[data-filter-group]').forEach(group => {
      const targetSel = group.dataset.filterTarget;
      const items = document.querySelectorAll(targetSel + ' [data-cat]');
      group.addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        items.forEach(it => {
          const show = cat === 'all' || it.dataset.cat.split(' ').includes(cat);
          it.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- TOC active ---------- */
  function initTOC() {
    const toc = document.querySelector('.toc');
    if (!toc) return;
    const links = [...toc.querySelectorAll('a')];
    const heads = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-100px 0px -70% 0px' });
    heads.forEach(h => obs.observe(h));
  }

  /* ---------- Search (client side over posts index) ---------- */
  function initSearch() {
    const input = document.querySelector('[data-search]');
    const out = document.querySelector('[data-search-results]');
    if (!input || !out) return;

    let posts = [];
    fetch(input.dataset.search)
      .then(r => r.json())
      .then(d => { posts = d; })
      .catch(() => {});

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { out.innerHTML = ''; out.classList.add('hidden'); return; }
      const res = posts.filter(p =>
        (p.title + ' ' + p.excerpt + ' ' + (p.tags || []).join(' ') + ' ' + p.category).toLowerCase().includes(q)
      ).slice(0, 8);
      out.classList.remove('hidden');
      out.innerHTML = res.length
        ? res.map(p => `<a href="${p.url}" class="search-hit"><span class="search-hit__t">${p.title}</span><span class="search-hit__c">${p.category}</span></a>`).join('')
        : '<div class="search-hit search-hit--empty">لا توجد نتائج مطابقة</div>';
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('[data-search]') && !e.target.closest('[data-search-results]')) {
        out.classList.add('hidden');
      }
    });
  }

  /* ---------- Newsletter fake submit ---------- */
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-newsletter]');
    if (!f) return;
    e.preventDefault();
    const btn = f.querySelector('button');
    const old = btn.textContent;
    btn.textContent = 'تم الاشتراك ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = old; btn.disabled = false; f.reset(); }, 2400);
  });

  /* ---------- Animated counters ---------- */
  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        let n = 0;
        const step = Math.max(1, Math.ceil(target / 45));
        const t = setInterval(() => {
          n += step;
          if (n >= target) { n = target; clearInterval(t); }
          el.textContent = n.toLocaleString('en-US') + suffix;
        }, 26);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
  }

  /* ---------- Year ---------- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Boot ---------- */
  function boot() {
    observeReveals();
    initFilters();
    initTOC();
    initSearch();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.MyTechol = { observeReveals };
})();
