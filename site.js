// career.zohaibmughal.dev: the role switch, the stub, the project tabs, the coupon and reveals.
// Everything here enhances a page that already works without it.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---- Hiring for: re-set the CV card, the folders, the record and the coupon for one role.
  const dataEl = $('#tracks');
  const tracks = dataEl ? JSON.parse(dataEl.textContent) : null;
  let current = null;
  function setTrack(id, push) {
    const t = tracks && tracks[id];
    if (!t) return;
    const roleField = $('[data-role-field]');
    // the role field follows the switch until the visitor types their own role
    const previousLabel = current ? tracks[current].label : roleField && roleField.defaultValue;
    current = id;
    const headline = $('[data-headline]');
    if (headline) headline.textContent = t.headline;
    $$('[data-view], [data-download]').forEach((a) => { a.href = t.pdf; });
    $$('[data-bullets]').forEach((ul) => {
      const lines = t.bullets[ul.dataset.bullets] || [];
      ul.innerHTML = lines.map((b) => `<li>${esc(b)}</li>`).join('');
    });
    const tools = $('[data-tools]');
    if (tools) tools.innerHTML = t.tools.map(esc).join('&nbsp;&middot; ');
    $$('[data-track-label]').forEach((el) => { el.textContent = t.label; });
    if (roleField && (!roleField.value || roleField.value === previousLabel)) roleField.value = t.label;
    const radio = $(`input[name="track"][value="${id}"]`);
    if (radio) radio.checked = true;
    if (push) {
      const url = new URL(location.href);
      url.searchParams.set('role', id);
      history.replaceState(null, '', url);
    }
  }
  if (tracks) {
    const fromUrl = new URLSearchParams(location.search).get('role');
    const checked = $('input[name="track"]:checked');
    setTrack(tracks[fromUrl] ? fromUrl : (checked ? checked.value : Object.keys(tracks)[0]), false);
    $$('input[name="track"]').forEach((r) => r.addEventListener('change', () => setTrack(r.value, true)));
  }

  // ---- Outside client work: one panel at a time.
  const tabs = $$('.ptab');
  function select(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.toggleAttribute('data-hidden', !on);
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab, false));
    tab.addEventListener('keydown', (ev) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[ev.key];
      if (step) { ev.preventDefault(); select(tabs[(i + step + tabs.length) % tabs.length], true); }
      if (ev.key === 'Home') { ev.preventDefault(); select(tabs[0], true); }
      if (ev.key === 'End') { ev.preventDefault(); select(tabs[tabs.length - 1], true); }
    });
  });
  $$('[data-next]').forEach((a) => a.addEventListener('click', (ev) => {
    const tab = document.getElementById(`tab-${a.dataset.next}`);
    if (!tab) return;
    ev.preventDefault();
    select(tab, true);
  }));

  // ---- The coupon writes the email in the visitor's own mail app.
  const form = $('[data-coupon]');
  if (form) form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!form.reportValidity()) return;
    const f = Object.fromEntries(new FormData(form));
    const subject = `${f.role || 'A role'}${f.company ? ` at ${f.company}` : ''}`;
    const body = [`Hello Zohaib,`, ``, `I am hiring for ${f.role || 'a role'}${f.company ? ` at ${f.company}` : ''} and would like to talk.`,
      ``, `${f.name}`, `${f.email}`].join('\n');
    location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  // ---- Reveal once on entering the viewport; never leaves anything hidden.
  const targets = $$('[data-reveal]');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
  addEventListener('load', () => setTimeout(() => targets.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
  }), 2500));
})();
