/* ========================================
   ESSENCE NOIRE — app.js
   JavaScript pur, sans framework
   ======================================== */

// ---- DATA ----
const perfumes = [
  {
    id: "1",
    name: "Sauvage",
    brand: "Dior",
    price: 1250,
    image: "assets/perfume-sauvage.jpg",
    family: "Fraîche",
    concentration: "Eau de Parfum",
    notes: {
      top:   ["Bergamote de Calabre", "Poivre"],
      heart: ["Lavande", "Poivre de Sichuan"],
      base:  ["Ambroxan", "Cèdre"],
    },
  },
  {
    id: "2",
    name: "Black Orchid",
    brand: "Tom Ford",
    price: 1950,
    image: "assets/perfume-tomford.jpg",
    family: "Orientale",
    concentration: "Eau de Parfum",
    notes: {
      top:   ["Truffe Noire", "Ylang-Ylang"],
      heart: ["Orchidée Noire", "Épices"],
      base:  ["Patchouli", "Vanille"],
    },
  },
  {
    id: "3",
    name: "N°5",
    brand: "Chanel",
    price: 1650,
    image: "assets/perfume-chanel.jpg",
    family: "Florale",
    concentration: "Parfum",
    notes: {
      top:   ["Aldéhydes", "Néroli"],
      heart: ["Jasmin", "Rose de Mai"],
      base:  ["Santal", "Vanille"],
    },
  },
  {
    id: "4",
    name: "Aventus",
    brand: "Creed",
    price: 3450,
    image: "assets/perfume-creed.jpg",
    family: "Fraîche",
    concentration: "Eau de Parfum",
    notes: {
      top:   ["Ananas", "Cassis"],
      heart: ["Bouleau", "Patchouli"],
      base:  ["Musc", "Chêne"],
    },
  },
  {
    id: "5",
    name: "La Nuit de L'Homme",
    brand: "Yves Saint Laurent",
    price: 1150,
    image: "assets/perfume-ysl.jpg",
    family: "Boisée",
    concentration: "Eau de Toilette",
    notes: {
      top:   ["Cardamome", "Bergamote"],
      heart: ["Cèdre", "Lavande"],
      base:  ["Vétiver", "Coumarine"],
    },
  },
  {
    id: "6",
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    price: 3250,
    image: "assets/perfume-baccarat.jpg",
    family: "Orientale",
    concentration: "Extrait",
    notes: {
      top:   ["Safran", "Jasmin"],
      heart: ["Ambre", "Bois d'Amourette"],
      base:  ["Cèdre", "Musc"],
    },
  },
];

// ---- STATE ----
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let isDark = true;

// ---- INIT ----
document.addEventListener("DOMContentLoaded", () => {
  // Restore theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") { setTheme("light"); } else { setTheme("dark"); }

  createParticles();
  renderProducts();
  updateCartBadge();
  initScrollBehaviors();
  initHeroParallax();
});

// ---- THEME ----
function toggleTheme() {
  setTheme(isDark ? "light" : "dark");
}
function setTheme(theme) {
  isDark = (theme === "dark");
  document.body.className = theme;
  localStorage.setItem("theme", theme);
  document.getElementById("icon-sun").style.display  = isDark ? "block" : "none";
  document.getElementById("icon-moon").style.display = isDark ? "none"  : "block";
}

// ---- SMOOTH SCROLL ----
function scrollTo(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  // Update active nav
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.section === sectionId);
  });
}

// ---- SCROLL BEHAVIORS ----
function initScrollBehaviors() {
  const header = document.getElementById("header");

  // Intersection observer for reveal animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  // Observe all reveal-item and product/service cards
  document.querySelectorAll(".reveal-item, .product-card, .service-card").forEach(el => {
    observer.observe(el);
  });

  // Header scroll effect
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
    updateActiveNav();
  }, { passive: true });
}

// ---- ACTIVE NAV on scroll ----
function updateActiveNav() {
  const sections = ["accueil", "collections", "services", "newsletter"];
  let current = "accueil";
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.section === current);
  });
}

// ---- HERO PARALLAX ----
function initHeroParallax() {
  const heroImg = document.getElementById("hero-img");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (heroImg && y < window.innerHeight) {
      heroImg.style.transform = `translateY(${y * 0.4}px)`;
    }
  }, { passive: true });
}

// ---- PARTICLES ----
function createParticles() {
  const container = document.getElementById("particles");
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 3 + 2;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      --dur: ${(Math.random() * 4 + 5).toFixed(1)}s;
      --delay: ${(Math.random() * 6).toFixed(1)}s;
    `;
    container.appendChild(p);
  }
}

// ---- RENDER PRODUCTS ----
function renderProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  grid.innerHTML = perfumes.map(p => createProductCardHTML(p)).join("");
}

function createProductCardHTML(p) {
  const isFav = favorites.includes(p.id);
  const topNotes = p.notes.top.slice(0, 2)
    .map(n => `<span class="product-note">${n}</span>`).join("");

  return `
    <div class="product-card reveal-item" onclick="openModal('${p.id}')">
      <div class="product-img-wrap">
        <img class="product-img" src="${p.image}" alt="${p.name}" loading="lazy" />
        <div class="product-overlay">
          <div class="product-discover">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Découvrir
          </div>
        </div>
        <span class="product-family-badge">${p.family}</span>
        ${isFav ? `<svg class="product-fav-badge" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>` : ""}
      </div>
      <div class="product-body">
        <p class="product-brand">${p.brand}</p>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-notes">${topNotes}</div>
        <div class="product-footer">
          <span class="product-price">${p.price.toLocaleString("fr-MA")} MAD</span>
          <div class="product-actions">
            <button class="action-btn fav-btn ${isFav ? "active" : ""}"
              onclick="event.stopPropagation(); toggleFavorite('${p.id}')"
              aria-label="Favoris">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="${isFav ? "currentColor" : "none"}"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button class="action-btn cart-add-btn"
              onclick="event.stopPropagation(); addToCart('${p.id}')"
              aria-label="Ajouter au panier">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ---- CART ----
function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart();
  updateCartBadge();
  renderCartItems();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartBadge();
  renderCartItems();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? "flex" : "none";
}

function openCart() {
  document.getElementById("cart-overlay").classList.remove("hidden");
  document.getElementById("cart-drawer").classList.add("open");
  renderCartItems();
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cart-overlay").classList.add("hidden");
  document.getElementById("cart-drawer").classList.remove("open");
  document.body.style.overflow = "";
}

function toggleCart() {
  const drawer = document.getElementById("cart-drawer");
  if (drawer.classList.contains("open")) closeCart();
  else openCart();
}

function renderCartItems() {
  const container = document.getElementById("cart-items");
  const footer    = document.getElementById("cart-footer");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted)"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span>Votre panier est vide</span>
      </div>`;
    footer.style.display = "none";
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    const p = perfumes.find(pf => pf.id === item.id);
    if (!p) return "";
    const subtotal = p.price * item.qty;
    total += subtotal;
    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${p.image}" alt="${p.name}" />
        <div class="cart-item-info">
          <p class="cart-item-brand">${p.brand}</p>
          <p class="cart-item-name">${p.name}</p>
          <p class="cart-item-price">${subtotal.toLocaleString("fr-MA")} MAD${item.qty > 1 ? ` <small style="color:var(--text-muted)">x${item.qty}</small>` : ""}</p>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${p.id}')" aria-label="Supprimer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
  }).join("");

  document.getElementById("cart-total-price").textContent = total.toLocaleString("fr-MA") + " MAD";
  footer.style.display = "block";
}

// ---- FAVORITES ----
function toggleFavorite(id) {
  const idx = favorites.indexOf(id);
  if (idx === -1) favorites.push(id);
  else favorites.splice(idx, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderProducts(); // re-render cards
  // Re-observe new elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal-item:not(.visible)").forEach(el => observer.observe(el));
}

// ---- PRODUCT MODAL ----
function openModal(id) {
  const p = perfumes.find(pf => pf.id === id);
  if (!p) return;
  const isFav = favorites.includes(p.id);

  const makeNotes = (arr) => arr.map(n => `<span class="modal-note">${n}</span>`).join("");

  document.getElementById("modal-content").innerHTML = `
    <img class="modal-img" src="${p.image}" alt="${p.name}" />
    <div class="modal-info">
      <span class="modal-concentration">${p.concentration}</span>
      <p class="modal-brand">${p.brand}</p>
      <h2 class="modal-name">${p.name}</h2>
      <span class="modal-family-badge">${p.family}</span>
      <div class="modal-notes">
        <h4>Notes de Tête</h4>
        <div class="modal-notes-group">${makeNotes(p.notes.top)}</div>
        <h4>Notes de Cœur</h4>
        <div class="modal-notes-group">${makeNotes(p.notes.heart)}</div>
        <h4>Notes de Fond</h4>
        <div class="modal-notes-group">${makeNotes(p.notes.base)}</div>
      </div>
      <p class="modal-price">${p.price.toLocaleString("fr-MA")} MAD</p>
      <div class="modal-actions">
        <button class="btn-primary" onclick="addToCart('${p.id}'); closeModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          Ajouter au panier
        </button>
        <button class="modal-fav-btn ${isFav ? "active" : ""}" id="modal-fav-${p.id}" onclick="toggleFavModal('${p.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="${isFav ? "currentColor" : "none"}"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          ${isFav ? "Favori" : "Favoris"}
        </button>
      </div>
    </div>
  `;

  document.getElementById("modal-overlay").classList.remove("hidden");
  document.getElementById("product-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  // store current product id
  document.getElementById("product-modal").dataset.productId = p.id;
}

function toggleFavModal(id) {
  toggleFavorite(id);
  // Update modal button
  const isFav = favorites.includes(id);
  const btn = document.getElementById(`modal-fav-${id}`);
  if (btn) {
    btn.classList.toggle("active", isFav);
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="${isFav ? "currentColor" : "none"}"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      ${isFav ? "Favori" : "Favoris"}`;
  }
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.getElementById("product-modal").classList.add("hidden");
  document.body.style.overflow = "";
}

// ---- MOBILE MENU ----
function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const menuIcon  = document.getElementById("menu-icon");
  const closeIcon = document.getElementById("close-icon");
  const isOpen = !menu.classList.contains("hidden");
  menu.classList.toggle("hidden");
  menuIcon.style.display  = isOpen ? "block" : "none";
  closeIcon.style.display = isOpen ? "none"  : "block";
}

// ---- NEWSLETTER ----
function handleNewsletter(e) {
  e.preventDefault();
  const input   = document.getElementById("email-input");
  const form    = e.target;
  const success = document.getElementById("newsletter-success");
  if (!input.value) return;
  form.style.display = "none";
  success.classList.remove("hidden");
  input.value = "";
  // Reset after 4s
  setTimeout(() => {
    success.classList.add("hidden");
    form.style.display = "";
  }, 4000);
}

// ---- KEYBOARD ESC ----
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeCart();
  }
});

/* ========================================
   CHECKOUT
   ======================================== */
let checkoutData = {};

function openCheckout() {
  if (cart.length === 0) return;
  closeCart();
  resetCheckoutSteps();
  document.getElementById("checkout-overlay").classList.remove("hidden");
  document.getElementById("checkout-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeCheckout() {
  document.getElementById("checkout-overlay").classList.add("hidden");
  document.getElementById("checkout-modal").classList.add("hidden");
  document.body.style.overflow = "";
}

function resetCheckoutSteps() {
  showCheckoutStep(1);
  // Reset step dots
  ["1","2","3"].forEach(n => {
    const dot = document.getElementById("step-dot-" + n);
    dot.classList.remove("active","done");
  });
  document.getElementById("step-dot-1").classList.add("active");
  // Clear errors
  ["firstname","lastname","email","phone","address","city"].forEach(f => {
    const el = document.getElementById("err-" + f);
    const inp = document.getElementById("c-" + f);
    if (el) el.textContent = "";
    if (inp) inp.classList.remove("invalid");
  });
}

function showCheckoutStep(n) {
  [1,2,3].forEach(i => {
    document.getElementById("checkout-step-" + i).classList.toggle("hidden", i !== n);
  });
}

function goToStep1() {
  showCheckoutStep(1);
  document.getElementById("step-dot-2").classList.remove("active","done");
  document.getElementById("step-dot-1").classList.add("active");
  document.querySelectorAll(".step-line").forEach(l => l.classList.remove("done"));
}

function goToStep2(event) {
  if (event) event.preventDefault();
  if (!validateCheckoutForm()) return;

  // Collect data
  checkoutData = {
    firstname: document.getElementById("c-firstname").value.trim(),
    lastname:  document.getElementById("c-lastname").value.trim(),
    email:     document.getElementById("c-email").value.trim(),
    phone:     document.getElementById("c-phone").value.trim(),
    address:   document.getElementById("c-address").value.trim(),
    city:      document.getElementById("c-city").value.trim(),
    zip:       document.getElementById("c-zip").value.trim(),
    note:      document.getElementById("c-note").value.trim(),
  };

  // Build summary
  document.getElementById("summary-address").innerHTML = `
    <strong>${checkoutData.firstname} ${checkoutData.lastname}</strong><br>
    ${checkoutData.address}<br>
    ${checkoutData.zip ? checkoutData.zip + " " : ""}${checkoutData.city}<br>
    <span style="color:var(--text-muted)">${checkoutData.phone}</span><br>
    <span style="color:var(--text-muted)">${checkoutData.email}</span>
    ${checkoutData.note ? `<br><em style="color:var(--text-muted);font-size:.8rem">📝 ${checkoutData.note}</em>` : ""}
  `;

  let total = 0;
  const itemsHtml = cart.map(item => {
    const p = perfumes.find(pf => pf.id === item.id);
    if (!p) return "";
    const sub = p.price * item.qty;
    total += sub;
    return `
      <div class="summary-item">
        <img src="${p.image}" alt="${p.name}" />
        <div class="summary-item-info">
          <div class="summary-item-brand">${p.brand}</div>
          <div class="summary-item-name">${p.name}</div>
          ${item.qty > 1 ? `<div style="font-size:.7rem;color:var(--text-muted)">Qté : ${item.qty}</div>` : ""}
        </div>
        <div class="summary-item-price">${sub.toLocaleString("fr-MA")} MAD</div>
      </div>`;
  }).join("");

  document.getElementById("summary-items").innerHTML = itemsHtml;
  document.getElementById("summary-total").textContent = total.toLocaleString("fr-MA") + " MAD";

  // Update step dots
  document.getElementById("step-dot-1").classList.remove("active");
  document.getElementById("step-dot-1").classList.add("done");
  document.getElementById("step-dot-2").classList.add("active");
  document.querySelectorAll(".step-line")[0].classList.add("done");

  showCheckoutStep(2);
}

function confirmOrder() {
  // Build order object
  const orderId = "EN-" + Date.now().toString(36).toUpperCase();
  const total = cart.reduce((sum, item) => {
    const p = perfumes.find(pf => pf.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  const order = {
    id:        orderId,
    date:      new Date().toISOString(),
    status:    "En attente",
    customer:  checkoutData,
    items:     cart.map(item => {
      const p = perfumes.find(pf => pf.id === item.id);
      return { id: item.id, qty: item.qty, name: p.name, brand: p.brand, price: p.price };
    }),
    total:     total,
  };

  // Save to localStorage
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  orders.unshift(order);
  localStorage.setItem("orders", JSON.stringify(orders));

  // Show confirmation
  document.getElementById("order-ref").textContent = orderId;
  document.getElementById("step-dot-2").classList.remove("active");
  document.getElementById("step-dot-2").classList.add("done");
  document.getElementById("step-dot-3").classList.add("active","done");
  document.querySelectorAll(".step-line")[1].classList.add("done");
  showCheckoutStep(3);

  // Clear cart
  cart = [];
  saveCart();
  updateCartBadge();
  renderCartItems();
}

function validateCheckoutForm() {
  const fields = [
    { id: "firstname", label: "Prénom",   regex: /^.{2,}$/ },
    { id: "lastname",  label: "Nom",      regex: /^.{2,}$/ },
    { id: "email",     label: "Email",    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { id: "phone",     label: "Téléphone",regex: /^[\d\s\+\-]{7,}$/ },
    { id: "address",   label: "Adresse",  regex: /^.{5,}$/ },
    { id: "city",      label: "Ville",    regex: /^.{2,}$/ },
  ];
  let valid = true;
  fields.forEach(f => {
    const inp = document.getElementById("c-" + f.id);
    const err = document.getElementById("err-" + f.id);
    const val = inp ? inp.value.trim() : "";
    if (!val || !f.regex.test(val)) {
      if (err) err.textContent = f.label + " invalide";
      if (inp) inp.classList.add("invalid");
      valid = false;
    } else {
      if (err) err.textContent = "";
      if (inp) inp.classList.remove("invalid");
    }
  });
  return valid;
}

// Close checkout on Escape (override existing keydown)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCheckout();
});

/* ========================================
   SEARCH
   ======================================== */
let searchOpen = false;

function toggleSearch() {
  searchOpen ? closeSearch() : openSearch();
}

function openSearch() {
  searchOpen = true;
  document.getElementById("search-overlay").classList.remove("hidden");
  const panel = document.getElementById("search-panel");
  panel.classList.remove("hidden", "closing");
  document.getElementById("search-btn").classList.add("active");
  document.body.style.overflow = "hidden";
  // Focus input after animation
  setTimeout(() => document.getElementById("search-input").focus(), 80);
}

function closeSearch() {
  if (!searchOpen) return;
  const panel = document.getElementById("search-panel");
  panel.classList.add("closing");
  setTimeout(() => {
    panel.classList.add("hidden");
    panel.classList.remove("closing");
    document.getElementById("search-overlay").classList.add("hidden");
    document.getElementById("search-btn").classList.remove("active");
    document.body.style.overflow = "";
    searchOpen = false;
    // Reset
    clearSearch(false);
  }, 240);
}

function clearSearch(focus = true) {
  const input = document.getElementById("search-input");
  input.value = "";
  document.getElementById("search-clear").classList.add("hidden");
  document.getElementById("search-results").classList.add("hidden");
  document.getElementById("search-empty").classList.add("hidden");
  document.getElementById("search-default").classList.remove("hidden");
  if (focus) input.focus();
}

function setSearchQuery(query) {
  document.getElementById("search-input").value = query;
  handleSearch();
}

function handleSearch() {
  const raw   = document.getElementById("search-input").value;
  const query = raw.trim().toLowerCase();

  // Show/hide clear button
  document.getElementById("search-clear").classList.toggle("hidden", raw.length === 0);

  if (!query) {
    clearSearch(false);
    return;
  }

  // Search in name, brand, family, concentration, notes
  const results = perfumes.filter(p => {
    const allNotes = [...p.notes.top, ...p.notes.heart, ...p.notes.base].join(" ").toLowerCase();
    return (
      p.name.toLowerCase().includes(query)        ||
      p.brand.toLowerCase().includes(query)       ||
      p.family.toLowerCase().includes(query)      ||
      p.concentration.toLowerCase().includes(query) ||
      allNotes.includes(query)
    );
  });

  document.getElementById("search-default").classList.add("hidden");

  if (results.length === 0) {
    document.getElementById("search-results").classList.add("hidden");
    document.getElementById("search-empty-query").textContent = `"${raw}"`;
    document.getElementById("search-empty").classList.remove("hidden");
    return;
  }

  document.getElementById("search-empty").classList.add("hidden");
  document.getElementById("search-results").classList.remove("hidden");

  const isFav = id => favorites.includes(id);

  document.getElementById("search-results").innerHTML = `
    <div class="search-results-header">${results.length} résultat${results.length > 1 ? "s" : ""}</div>
    ${results.map(p => {
      // Highlight matching text in name
      const nameHL = highlightMatch(p.name, query);
      const brandHL = highlightMatch(p.brand, query);
      const topNotes = p.notes.top.slice(0, 3);
      return `
        <div class="search-result-item" onclick="openModalFromSearch('${p.id}')">
          <img class="search-result-img" src="${p.image}" alt="${p.name}" loading="lazy" />
          <div class="search-result-info">
            <p class="search-result-brand">${brandHL}</p>
            <p class="search-result-name">${nameHL}</p>
            <div class="search-result-tags">
              <span class="search-result-tag">${p.family}</span>
              <span class="search-result-tag">${p.concentration}</span>
              ${topNotes.map(n => `<span class="search-result-tag">${highlightMatch(n, query)}</span>`).join("")}
            </div>
          </div>
          <p class="search-result-price">${p.price.toLocaleString("fr-MA")} MAD</p>
          <div class="search-result-actions" onclick="event.stopPropagation()">
            <button class="search-action-btn add-cart" onclick="addToCart('${p.id}'); closeSearch()">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Panier
            </button>
            <button class="search-action-btn" onclick="toggleFavorite('${p.id}'); handleSearch()" style="${isFav(p.id) ? "color:var(--rose);border-color:var(--rose)" : ""}">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="${isFav(p.id) ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              ${isFav(p.id) ? "Favori" : "Favoris"}
            </button>
          </div>
        </div>`;
    }).join("")}
  `;
}

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function openModalFromSearch(id) {
  closeSearch();
  setTimeout(() => openModal(id), 260);
}

// Close search on Escape — add to existing keydown listener
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && searchOpen) {
    e.stopImmediatePropagation();
    closeSearch();
  }
});
