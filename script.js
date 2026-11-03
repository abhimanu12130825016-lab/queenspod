(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dishes = [
    { title: 'The Pod Momo Platter', price: '₹395', category: 'Guest favourite', group: 'small-plates', origin: 'Made for the table', description: "A generous table starter designed for sharing, with hand-folded momos and the house's bright chilli dip.", image: './assets/queenspod/hero.jpg' },
    { title: 'Afghani Paneer Tikka', price: '₹465', category: 'Small plates', group: 'small-plates', origin: 'Charred to order', description: 'Soft paneer, warm spice and a gentle char — one of the dishes guests mention when they tell friends to visit.', image: './assets/queenspod/feature.jpg' },
    { title: 'Crispy Fried Chicken', price: '₹495', category: 'Small plates', group: 'small-plates', origin: 'Golden, crisp, generous', description: 'A sharing plate with a crackling crust, tender centre and a little heat on the finish.', image: './assets/queenspod/hero.jpg' },
    { title: 'Thai Basil Fried Rice', price: '₹425', category: 'Wok favourite', group: 'mains', origin: 'High-flame wok', description: 'Fragrant rice, basil and fresh vegetables tossed fast over a hot wok for a deeply savoury finish.', image: './assets/queenspod/dining.jpg' },
    { title: 'Himalayan Thukpa', price: '₹360', category: 'From the hills', group: 'mains', origin: 'Slow comfort', description: 'A warm, aromatic bowl for cool Gangtok afternoons — nourishing, fragrant and quietly restorative.', image: './assets/queenspod/interior.jpg' },
    { title: 'The Queen’s Burger', price: '₹495', category: 'House special', group: 'mains', origin: 'Built for a long lunch', description: 'A generous house burger with crisp edges, bright pickles and all the room you need for a second bite.', image: './assets/queenspod/food.jpg' },
    { title: 'Wood-fired Pizza', price: '₹575', category: 'From the hearth', group: 'hearth', origin: 'Fresh from the oven', description: 'A crisp, blistered base, generous toppings and the kind of centrepiece that brings the table together.', image: './assets/queenspod/feature.jpg' },
    { title: 'Grilled Paneer Steak', price: '₹525', category: 'From the hearth', group: 'hearth', origin: 'Smoke and soft spice', description: 'A beautifully charred vegetarian plate with a rich sauce and the comfort of a mountain evening.', image: './assets/queenspod/feature.jpg' },
    { title: 'Butter Garlic Prawns', price: '₹695', category: 'Sea & fire', group: 'hearth', origin: 'Finished in the pan', description: 'Prawns, garlic butter and a bright finish — made for slow eating and a table full of conversation.', image: './assets/queenspod/hero.jpg' },
    { title: 'Korean Fried Chicken', price: '₹525', category: 'Pod signature', group: 'mains', origin: 'Sweet, hot, crisp', description: 'Crisp chicken in a glossy Korean-inspired glaze, served with enough crunch for the whole table.', image: './assets/queenspod/ambience.jpg' },
    { title: 'Himalayan Berry Cooler', price: '₹245', category: 'Cold drinks', group: 'drinks', origin: 'Freshly shaken', description: 'A bright, icy cooler for slow afternoons overlooking the hills.', image: './assets/queenspod/interior.jpg' },
    { title: 'Queen’s Pod Coffee', price: '₹180', category: 'Hot drinks', group: 'drinks', origin: 'Stay a while', description: 'Warm, carefully made and best enjoyed after the last plate has left the table.', image: './assets/queenspod/dining.jpg' },
    { title: 'Sikkim Craft Brew', price: '₹295', category: 'Cold drinks', group: 'drinks', origin: 'Pour something easy', description: 'A chilled local pour for evenings under the lights and stories that take their time.', image: './assets/queenspod/ambience.jpg' },
    { title: 'Chocolate Pod', price: '₹285', category: 'Something sweet', group: 'drinks', origin: 'The final course', description: 'A warm, chocolate-led finish that asks you to stay for just one more conversation.', image: './assets/queenspod/feature.jpg' },
    { title: 'The Long Lunch', price: '₹1,500', category: 'For two', group: 'mains', origin: 'A table worth travelling for', description: 'A considered spread for two — small plates, a main to share and enough time to take in the view.', image: './assets/queenspod/interior.jpg' }
  ];

  const track = $('#menu-scroll-track');
  const stage = $('#menu-stage');
  const world = $('#world');
  const orb = $('#orb');
  const heroInfo = $('#hero-info');
  const progressBar = $('#progress-bar');
  const splash = $('#splash');
  const splashProgress = $('#splash-progress');
  let activeIndex = 0;
  let scrollFrame = null;
  let selectedIndex = 0;
  let pointerX = 0;
  let pointerY = 0;

  const imagePool = [...new Set(dishes.map((dish) => dish.image))];
  let loadedImages = 0;
  imagePool.forEach((src) => {
    const image = new Image();
    image.onload = image.onerror = () => {
      loadedImages += 1;
      if (splashProgress) splashProgress.style.width = `${(loadedImages / imagePool.length) * 100}%`;
    };
    image.src = src;
  });

  const points = dishes.map((_, index) => {
    const y = 1 - (index / (dishes.length - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(angle) * radius, y: y * -1, z: Math.sin(angle) * radius };
  });

  const buildStageCards = () => {
    dishes.forEach((dish, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'menu-card-3d';
      card.dataset.index = String(index);
      card.innerHTML = `<span class="card-number">${String(index + 1).padStart(2, '0')}</span><figure><img src="${dish.image}" alt="${dish.title}" /><figcaption>${dish.title}</figcaption></figure>`;
      card.addEventListener('click', () => openDish(index));
      orb.appendChild(card);
    });
  };

  const buildGrid = () => {
    const rows = $('#grid-rows');
    if (!rows) return;
    dishes.forEach((dish, index) => {
      const figure = document.createElement('figure');
      figure.className = 'grid-figure';
      figure.dataset.index = String(index);
      figure.innerHTML = `<img src="${dish.image}" alt="${dish.title}" loading="lazy" /><figcaption><span>${dish.title}</span><strong>${dish.price}</strong></figcaption>`;
      figure.addEventListener('click', () => openDish(index));
      rows.appendChild(figure);
    });
  };

  const buildCue = () => {
    const dots = $('#cue-dots');
    if (!dots) return;
    dishes.forEach((_, index) => {
      const dot = document.createElement('i');
      dot.className = `cue-dot${index === 0 ? ' is-active' : ''}`;
      dots.appendChild(dot);
    });
  };

  const updateHero = (index) => {
    const dish = dishes[index];
    $('#hero-category').textContent = dish.category;
    $('#hero-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(dishes.length).padStart(2, '0')}`;
    $('#hero-title').textContent = dish.title;
    $('#hero-price').textContent = dish.price;
    $('#hero-description').textContent = dish.description;
    $('#hero-origin').textContent = dish.origin;
    $$('.cue-dot').forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
    $$('.menu-card-3d').forEach((card, cardIndex) => card.classList.toggle('is-active', cardIndex === index));
  };

  const updateStage = () => {
    const range = Math.max(track.offsetHeight - window.innerHeight, 1);
    const progress = clamp(-track.getBoundingClientRect().top / range);
    const focus = progress * (dishes.length - 1);
    const nextIndex = clamp(Math.round(focus), 0, dishes.length - 1);
    if (nextIndex !== activeIndex) {
      activeIndex = nextIndex;
      updateHero(activeIndex);
    }
    progressBar.style.width = `${Math.min(100, ((window.scrollY || 0) / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)) * 100)}%`;
    const cardWidth = Math.min(270, Math.max(150, window.innerWidth * .19));
    const radius = Math.min(350, Math.max(220, window.innerHeight * .37));
    const yaw = (reduceMotion ? 0 : progress * 18) + pointerX * 7;
    const pitch = (reduceMotion ? 0 : -progress * 8) + pointerY * 5;
    world.style.setProperty('--headline-width', `${Math.min(620, Math.max(280, window.innerWidth * .44))}px`);
    world.style.transform = `translate3d(-50%,-50%,0) rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`;
    $$('.menu-card-3d').forEach((card, index) => {
      const point = points[index];
      const distance = Math.abs(index - focus);
      const settled = clamp(progress * 2.7 - index / (dishes.length * 1.05), 0, 1);
      const focusAmount = clamp(1 - distance / 1.6, 0, 1);
      const x = point.x * radius * (1 - settled) + (index - focus) * cardWidth * .62 * settled;
      const y = point.y * radius * (1 - settled) + Math.sin(index * 1.4) * 44 * settled;
      const z = point.z * radius * (1 - settled) + focusAmount * 270 * settled;
      const scale = .46 + focusAmount * .49 + settled * .05;
      const opacity = .2 + clamp(settled * 1.4, 0, 1) * .72 + focusAmount * .08;
      const rotateY = point.x * 35 * (1 - settled) - (index - focus) * 5;
      const rotateX = point.y * -25 * (1 - settled);
      card.style.width = `${cardWidth}px`;
      card.style.height = `${cardWidth * .67}px`;
      card.style.opacity = opacity.toFixed(3);
      card.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
    });
    heroInfo.classList.toggle('is-visible', progress > .035 && !$('#grid-view').classList.contains('is-open'));
    stage.classList.toggle('is-complete', progress > .985);
  };

  const scheduleUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => { scrollFrame = null; updateStage(); });
  };

  const openDish = (index) => {
    selectedIndex = index;
    const dish = dishes[index];
    $('#dish-modal-image').src = dish.image;
    $('#dish-modal-image').alt = dish.title;
    $('#dish-modal-category').textContent = dish.category;
    $('#dish-modal-title').textContent = dish.title;
    $('#dish-modal-description').textContent = dish.description;
    $('#dish-modal-price').textContent = dish.price;
    $('#dish-modal').classList.add('is-open');
    $('#dish-modal').setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };

  const closeModal = (selector) => {
    const modal = $(selector);
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!$$('.dish-modal.is-open,.reservation-modal.is-open,.lightbox.is-open').length) document.body.classList.remove('modal-open');
  };

  const openReservation = () => {
    closeModal('#dish-modal');
    $('#reservation-form-view').hidden = false;
    $('#reservation-success').hidden = true;
    $('#reservation-form').reset();
    $('#reservation-modal').classList.add('is-open');
    $('#reservation-modal').setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };

  const setFilter = (filter) => {
    $$('.filter-button').forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $$('.menu-card', $('#archive-grid')).forEach((card) => card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.group !== filter));
  };

  const buildArchive = () => {
    const grid = $('#archive-grid');
    dishes.forEach((dish, index) => {
      const card = document.createElement('article');
      card.className = `menu-card reveal${index === 14 ? ' wide' : ''}`;
      card.dataset.group = dish.group;
      card.innerHTML = `<div class="menu-card-image"><img src="${dish.image}" alt="${dish.title}" loading="lazy" /></div><div class="menu-card-body"><span class="menu-number">${String(index + 1).padStart(2, '0')} / ${dish.category}</span><h3>${dish.title}</h3><p>${dish.description}</p><strong>${dish.price}</strong></div>`;
      card.addEventListener('click', () => openDish(index));
      grid.appendChild(card);
    });
  };

  const initReveal = () => {
    const elements = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) { elements.forEach((element) => element.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver((entries, instance) => entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); instance.unobserve(entry.target); }), { threshold: .12, rootMargin: '0px 0px -7%' });
    elements.forEach((element) => observer.observe(element));
  };

  const openGrid = () => { $('#grid-view').classList.add('is-open'); $('#grid-view').setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open'); heroInfo.classList.remove('is-visible'); };
  const closeGrid = () => { $('#grid-view').classList.remove('is-open'); $('#grid-view').setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); updateStage(); };

  buildStageCards();
  buildGrid();
  buildCue();
  buildArchive();
  updateHero(0);
  initReveal();

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('pointermove', (event) => { if (event.pointerType === 'touch') return; pointerX = clamp(event.clientX / window.innerWidth - .5, -.5, .5); pointerY = clamp(event.clientY / window.innerHeight - .5, -.5, .5); scheduleUpdate(); }, { passive: true });
  $('#hero-view-button').addEventListener('click', () => openDish(activeIndex));
  $('#hero-reserve-button').addEventListener('click', openReservation);
  $('#top-reserve-button').addEventListener('click', openReservation);
  $('#mobile-reserve-button').addEventListener('click', () => { $('body').classList.remove('menu-open'); openReservation(); });
  $('#dish-modal-reserve').addEventListener('click', openReservation);
  $('#grid-button').addEventListener('click', openGrid);
  $('#grid-close-button').addEventListener('click', closeGrid);
  $$('.filter-button').forEach((button) => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  $$('[data-close-dish]').forEach((button) => button.addEventListener('click', () => closeModal('#dish-modal')));
  $$('[data-close-reservation]').forEach((button) => button.addEventListener('click', () => closeModal('#reservation-modal')));
  $('#reservation-form').addEventListener('submit', (event) => { event.preventDefault(); $('#reservation-form-view').hidden = true; $('#reservation-success').hidden = false; });
  $$('.gallery-item').forEach((item) => item.addEventListener('click', () => { $('#lightbox-image').src = item.dataset.full; $('#lightbox-image').alt = $('img', item).alt; $('#lightbox-caption').textContent = item.dataset.caption; $('#lightbox').classList.add('is-open'); $('#lightbox').setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open'); }));
  $$('[data-close-lightbox]').forEach((button) => button.addEventListener('click', () => closeModal('#lightbox')));
  $('#nav-toggle').addEventListener('click', () => { const open = document.body.classList.toggle('menu-open'); $('#nav-toggle').setAttribute('aria-expanded', String(open)); });
  $$('.mobile-nav a').forEach((link) => link.addEventListener('click', () => document.body.classList.remove('menu-open')));
  $('#back-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  document.addEventListener('keydown', (event) => { if (event.key !== 'Escape') return; closeGrid(); closeModal('#dish-modal'); closeModal('#reservation-modal'); closeModal('#lightbox'); });
  window.addEventListener('scroll', () => { $('#site-header').classList.toggle('is-scrolled', window.scrollY > 25); $('#back-top').classList.toggle('is-visible', window.scrollY > window.innerHeight * .5); }, { passive: true });

  setTimeout(() => { splash.classList.add('is-out'); document.body.classList.add('revealed'); setTimeout(() => splash.remove(), 800); updateStage(); }, reduceMotion ? 250 : 1100);
  updateStage();
})();
