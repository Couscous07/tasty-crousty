// ========================================
// TASTY CROUSTY - Main JavaScript
// ========================================

// === CART STATE ===
let cart = JSON.parse(localStorage.getItem('tc_cart') || '[]');

function saveCart() {
  localStorage.setItem('tc_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function addToCart(name, price, size, category) {
  const existing = cart.find(i => i.name === name && i.size === size);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, size, category, qty: 1, emoji: getCategoryEmoji(category) });
  }
  saveCart();
  showToast('✅ Produit ajouté au panier !');
}

function getCategoryEmoji(cat) {
  const map = { 'caleçon': '🩲', 'culotte': '👙', 'maillot': '🩱', 'default': '👕' };
  return Object.entries(map).find(([k]) => cat && cat.toLowerCase().includes(k))?.[1] || map.default;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function updateQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) removeFromCart(index);
  else { saveCart(); renderCart(); }
}

// === TOAST ===
function showToast(msg, duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">🍪</span><span class="toast-msg"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// === NAVBAR SCROLL ===
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll);
  onScroll();
}

// === MOBILE MENU ===
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('mobileClose');
  if (!hamburger || !mobileMenu) return;
  hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

// === FADE IN ON SCROLL ===
function initFadeUp() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// === COUNTDOWN ===
function initCountdown(targetDate) {
  const timer = document.getElementById('countdown');
  if (!timer) return;
  function update() {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;
    if (diff <= 0) { timer.innerHTML = '<span class="countdown-number text-gradient">BIENTÔT</span>'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const items = [
      [d, 'JOURS'], [h, 'HEURES'], [m, 'MINUTES'], [s, 'SECONDES']
    ];
    timer.innerHTML = items.map(([val, label]) => `
      <div class="countdown-item">
        <span class="countdown-number">${String(val).padStart(2,'0')}</span>
        <span class="countdown-label">${label}</span>
      </div>`).join('');
  }
  update();
  setInterval(update, 1000);
}

// === FILTER TABS ===
function initFilterTabs() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      document.querySelectorAll('.product-card[data-category]').forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

// === SIZE SELECTION ===
function initSizeButtons() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.size-grid')?.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// === ADD TO CART BUTTON ===
function initAddToCart() {
  const btn = document.querySelector('.btn-add-cart');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const size = document.querySelector('.size-btn.active')?.textContent;
    if (!size) { showToast('⚠️ Veuillez choisir une taille'); return; }
    const name = document.querySelector('.product-info h1')?.textContent || 'Produit';
    const price = document.querySelector('.product-price')?.textContent?.match(/[\d.,]+/)?.[0] || '0';
    const cat = document.querySelector('.product-info .category')?.textContent || '';
    addToCart(name, parseFloat(price), size, cat);
  });
}

// === RENDER CART ===
function renderCart() {
  const cartList = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartContent = document.getElementById('cartContent');
  if (!cartList) return;

  if (cart.length === 0) {
    if (emptyCart) emptyCart.style.display = 'block';
    if (cartContent) cartContent.style.display = 'none';
    return;
  }
  if (emptyCart) emptyCart.style.display = 'none';
  if (cartContent) cartContent.style.display = 'grid';

  cartList.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-img">${item.emoji || '👕'}</div>
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">Taille: ${item.size} · ${item.category}</div>
        </div>
      </div>
      <div class="qty-control">
        <button class="qty-btn" onclick="updateQty(${i}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
      </div>
      <div class="cart-item-price">${item.price?.toFixed(2)}€</div>
      <div class="remove-btn" onclick="removeFromCart(${i})">🗑</div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);
  const shipping = subtotal >= 60 ? 0 : 4.99;
  const total = subtotal + shipping;

  const setSummary = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setSummary('subtotal', subtotal.toFixed(2) + '€');
  setSummary('shipping', shipping === 0 ? 'GRATUIT' : shipping.toFixed(2) + '€');
  setSummary('total', total.toFixed(2) + '€');
}

// === FORM SUBMIT ===
function initForms() {
  document.querySelectorAll('form[data-feedback]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const msg = form.dataset.feedback || 'Message envoyé !';
      showToast('✅ ' + msg);
      form.reset();
    });
  });
}

// === NEWSLETTER ===
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value;
    if (email) showToast('🎉 Merci ! Tu seras le premier informé.');
    form.reset();
  });
}

// === GALLERY THUMBNAILS ===
function initGallery() {
  document.querySelectorAll('.thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

// === ACTIVE NAV LINK ===
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === 'index.html' && href === './') || href.includes(path)) {
      a.classList.add('active');
    }
  });
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initNavbar();
  initMobileMenu();
  initFadeUp();
  initCountdown('2025-09-01');
  initFilterTabs();
  initSizeButtons();
  initAddToCart();
  renderCart();
  initForms();
  initNewsletter();
  initGallery();
  initActiveNav();
});
