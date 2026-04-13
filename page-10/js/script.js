const currentSlide = {"id": "slide10", "background": {"src": "../assets/image_028.png", "left": 0.0, "top": 0.0, "width": 100.0, "height": 99.9996091647264}, "groups": [{"id": "home", "type": "internal", "target": "slide1", "href": null, "left": 51.5011811023622, "top": 84.0320415776577, "width": 22.04206036745407, "height": 8.59281413272375, "members": [{"src": "../assets/image_009.png", "left": 0.0, "top": 0.0, "width": 100.0, "height": 100.0}, {"src": "../assets/image_010.png", "left": 39.50614711329283, "top": 25.03673705018981, "width": 38.23527952504706, "height": 51.111120829907456}], "target_page": "../index.html"}, {"id": "back-wrap", "type": "internal", "target": "slide9", "href": null, "left": 28.486679790026248, "top": 84.0320415776577, "width": 22.13467483231263, "height": 8.59281413272375, "members": [{"src": "../assets/image_022.png", "left": 0.0, "top": 0.0, "width": 100.0, "height": 100.0}, {"src": "../assets/image_023.png", "left": 40.62000163373288, "top": 25.03673705018981, "width": 34.8526610083294, "height": 58.32120427549289}], "target_page": "../page-9/index.html"}]};
const viewer = document.getElementById('viewer');

function navigateWithFade(href) {
  if (!href || href === '#') return;
  try {
    sessionStorage.removeItem('pageTransitionOverlayHTML');
    sessionStorage.removeItem('pageTransitionPending');
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

renderSlide(currentSlide);

try {
  sessionStorage.removeItem('pageTransitionOverlayHTML');
  sessionStorage.removeItem('pageTransitionPending');
} catch (e) {}
