const currentSlide = {"id": "slide1", "background": {"src": "assets/image_001.png", "left": 0.0, "top": -7.516062953942017e-06, "width": 100.0, "height": 100.0025930417191}, "groups": [{"id": "home-map", "type": "internal", "target": "slide10", "href": null, "left": 26.04155730533683, "top": 54.397603337973756, "width": 20.437773403324584, "height": 21.14673624737107, "members": [{"src": "assets/image_002.png", "left": 0.0, "top": 0.0, "width": 100.0, "height": 99.99999999999999}, {"src": "assets/image_003.png", "left": 21.67816227265187, "top": 18.395622026209693, "width": 56.64371112763958, "height": 63.208827032431394}], "target_page": "page-10/index.html"}, {"id": "home-location", "type": "internal", "target": "slide2", "href": null, "left": 53.520683872849226, "top": 29.939372429788325, "width": 20.437773403324584, "height": 21.14673624737107, "members": [{"src": "assets/image_002.png", "left": 0.0, "top": 0.0, "width": 100.0, "height": 99.99999999999999}, {"src": "assets/image_004.png", "left": 15.140239258430853, "top": 11.137041285015062, "width": 77.03543571824797, "height": 70.88417825379354}], "target_page": "page-2/index.html"}, {"id": "home-register", "type": "internal", "target": "slide3", "href": null, "left": 26.04155730533683, "top": 29.939372429788325, "width": 20.437773403324584, "height": 21.14673624737107, "members": [{"src": "assets/image_002.png", "left": 0.0, "top": 0.0, "width": 100.0, "height": 99.99999999999999}, {"src": "assets/image_005.png", "left": 22.357910207634365, "top": 12.491492031921362, "width": 55.284250930617915, "height": 68.17524121755555}], "target_page": "page-3/index.html"}, {"id": "home-schedule", "type": "internal", "target": "slide4", "href": null, "left": 53.520683872849226, "top": 54.397603337973756, "width": 20.437773403324584, "height": 21.14673624737107, "members": [{"src": "assets/image_002.png", "left": 0.0, "top": 0.0, "width": 100.0, "height": 99.99999999999999}, {"src": "assets/image_006.png", "left": 20.545260938662157, "top": 18.395622026209693, "width": 58.90944244973237, "height": 63.66032246220862}], "target_page": "page-4/index.html"}]};
const viewer = document.getElementById('viewer');

function navigateWithFade(href) {
  if (!href || href === '#') return;
  try {
    if (viewer) {
      sessionStorage.setItem('pageTransitionOverlayHTML', viewer.outerHTML);
      sessionStorage.setItem('pageTransitionPending', '1');
    }
  } catch (e) {}
  window.location.href = href;
}

function rememberPage10Origin(href) {
  if (!href || !/page-10\/index\.html$/.test(href)) return;
  if (currentSlide && currentSlide.id === 'slide1') {
    localStorage.setItem('page10Origin', 'slide1');
  } else if (currentSlide && currentSlide.id === 'slide9') {
    localStorage.setItem('page10Origin', 'slide9');
  }
}

function smartBackTarget() {
  const origin = localStorage.getItem('page10Origin');
  if (origin === 'slide9') return '../page-9/index.html';
  return '../index.html';
}


function memberClass(groupId, idx) {
  const textish = /home|next|back|go-map/.test(groupId) && idx > 0;
  return textish ? 'member-text' : 'member-shape';
}

function tightenHitArea(groupEl, images) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  images.forEach((img) => {
    const left = parseFloat(img.style.left || '0');
    const top = parseFloat(img.style.top || '0');
    const width = parseFloat(img.style.width || '0');
    const height = parseFloat(img.style.height || '0');
    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, left + width);
    maxY = Math.max(maxY, top + height);
  });
  if (!Number.isFinite(minX)) return;
  const pad = 0.6;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(100, maxX + pad);
  maxY = Math.min(100, maxY + pad);
  groupEl.style.setProperty('--fx-left', `${minX}%`);
  groupEl.style.setProperty('--fx-top', `${minY}%`);
  groupEl.style.setProperty('--fx-width', `${maxX - minX}%`);
  groupEl.style.setProperty('--fx-height', `${maxY - minY}%`);
}

function addRipple(ev, el) {
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = el.getBoundingClientRect();
  r.style.left = `${((ev.clientX - rect.left) / rect.width) * 100}%`;
  r.style.top = `${((ev.clientY - rect.top) / rect.height) * 100}%`;
  r.style.animation = 'rippleAnim .55s ease-out forwards';
  el.appendChild(r);
  r.addEventListener('animationend', () => r.remove(), { once: true });
}

function renderSlide(slide) {
  viewer.innerHTML = '';
  const bg = document.createElement('img');
  bg.className = 'bg';
  bg.src = slide.background.src;
  bg.alt = '';
  bg.style.left = `${slide.background.left}%`;
  bg.style.top = `${slide.background.top}%`;
  bg.style.width = `${slide.background.width}%`;
  bg.style.height = `${slide.background.height}%`;
  viewer.appendChild(bg);

  slide.groups.forEach((group) => {
    const clickable = group.type !== 'decor';
    const el = document.createElement(clickable ? 'a' : 'div');
    el.className = `btn-group ${clickable ? 'is-clickable' : 'decor'}`;
    el.style.left = `${group.left}%`;
    el.style.top = `${group.top}%`;
    el.style.width = `${group.width}%`;
    el.style.height = `${group.height}%`;
    if (clickable) {
      let href = '#';
      let target = '';
      let rel = '';
      if (group.type === 'external' && group.href) {
        href = group.href;
        target = '_blank';
        rel = 'noopener noreferrer';
      } else if (group.type === 'internal' && group.target_page) {
        href = group.target_page;
      }
      if (currentSlide && currentSlide.id === 'slide10' && group.id === 'back-wrap') {
        href = smartBackTarget();
      }
      el.href = href;
      if (target) el.target = target;
      if (rel) el.rel = rel;
      el.setAttribute('aria-label', group.id || 'button');
    }

    const fx = document.createElement('span');
    fx.className = 'btn-fx';
    const shine = document.createElement('span');
    shine.className = 'shine';
    fx.appendChild(shine);
    el.appendChild(fx);

    const visual = document.createElement('span');
    visual.className = 'btn-visual';
    el.appendChild(visual);

    const imgs = [];
    group.members.forEach((member, idx) => {
      const img = document.createElement('img');
      img.src = member.src;
      img.alt = '';
      img.className = memberClass(group.id || '', idx);
      img.style.left = `${member.left}%`;
      img.style.top = `${member.top}%`;
      img.style.width = `${member.width}%`;
      img.style.height = `${member.height}%`;
      visual.appendChild(img);
      imgs.push(img);
    });

    tightenHitArea(el, imgs);

    if (clickable) {
      el.addEventListener('pointermove', (ev) => {
        const rect = el.getBoundingClientRect();
        const mx = ((ev.clientX - rect.left) / rect.width) * 100;
        const my = ((ev.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--mx', `${mx}%`);
        el.style.setProperty('--my', `${my}%`);
        });
      el.addEventListener('pointerenter', (ev) => {
        const rect = el.getBoundingClientRect();
        const mx = (((ev.clientX || (rect.left + rect.width / 2)) - rect.left) / rect.width) * 100;
        const my = (((ev.clientY || (rect.top + rect.height / 2)) - rect.top) / rect.height) * 100;
        el.style.setProperty('--mx', `${mx}%`);
        el.style.setProperty('--my', `${my}%`);
      });
      el.addEventListener('pointerdown', () => el.classList.add('is-pressed'));
      const clearPressed = () => el.classList.remove('is-pressed');
      el.addEventListener('pointerup', clearPressed);
      el.addEventListener('pointerleave', clearPressed);
      el.addEventListener('click', (ev) => {
        addRipple(ev, el);
        if (el.target === '_blank') return;
        const href = el.getAttribute('href');
        if (href && href !== '#') {
          ev.preventDefault();
          rememberPage10Origin(href);
          navigateWithFade(href);
        }
      });
    }

    viewer.appendChild(el);
  });
}

function playPageTransitionOverlay() {
  try {
    if (sessionStorage.getItem('pageTransitionPending') !== '1') return;
    const overlayHTML = sessionStorage.getItem('pageTransitionOverlayHTML');
    sessionStorage.removeItem('pageTransitionPending');
    sessionStorage.removeItem('pageTransitionOverlayHTML');
    if (!overlayHTML) return;

    const host = document.createElement('div');
    host.className = 'page-transition-overlay';
    host.innerHTML = overlayHTML;
    document.body.appendChild(host);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        host.classList.add('is-hiding');
      });
    });

    host.addEventListener('transitionend', () => host.remove(), { once: true });
    window.setTimeout(() => host.remove(), 450);
  } catch (e) {}
}

renderSlide(currentSlide);
window.addEventListener('load', () => {
  playPageTransitionOverlay();
});
