/* ========================================
   ESSENCE NOIRE — admin.js
   Authentification + Gestion commandes + produits
   ======================================== */

/* ========================================
   AUTHENTIFICATION
   ======================================== */

// Identifiants admin (modifiables ici)
const ADMIN_CREDENTIALS = [
  { username: "admin",   password: "EssenceNoire2026!" },
  { username: "manager", password: "Parfum@Admin99"    },
];

const MAX_ATTEMPTS   = 5;   // tentatives avant blocage
const LOCKOUT_SECS   = 30;  // secondes de blocage
const SESSION_KEY    = "admin_session";
const ATTEMPTS_KEY   = "admin_attempts";
const LOCK_UNTIL_KEY = "admin_lock_until";

let loginAttempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0");
let lockUntil     = parseInt(localStorage.getItem(LOCK_UNTIL_KEY) || "0");
let lockInterval  = null;

// ---- Boot : vérifier session existante ----
function bootAuth() {
  const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  if (session && session.loggedIn) {
    showAdminApp(session.username);
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("admin-app").classList.add("hidden");
  createLoginParticles();
  checkLockState();
}

function showAdminApp(username) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("admin-app").classList.remove("hidden");
  // Show user chip in topbar
  const initial = username.charAt(0).toUpperCase();
  document.getElementById("topbar-user").innerHTML = `
    <div class="topbar-user-avatar">${initial}</div>
    <span>${username}</span>
  `;
}

// ---- Login handler ----
function handleLogin(event) {
  event.preventDefault();

  // Check lock
  const now = Date.now();
  if (lockUntil > now) { checkLockState(); return; }

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  // Simulate loading
  setLoginLoading(true);
  setTimeout(() => {
    const match = ADMIN_CREDENTIALS.find(c => c.username === username && c.password === password);

    if (match) {
      // Success
      loginAttempts = 0;
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCK_UNTIL_KEY);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ loggedIn: true, username }));
      setLoginLoading(false);
      animateLoginSuccess(() => showAdminApp(username));
    } else {
      // Failure
      loginAttempts++;
      localStorage.setItem(ATTEMPTS_KEY, loginAttempts);
      setLoginLoading(false);
      shakeInputs();

      if (loginAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_SECS * 1000;
        lockUntil = until;
        localStorage.setItem(LOCK_UNTIL_KEY, until);
        loginAttempts = 0;
        localStorage.setItem(ATTEMPTS_KEY, "0");
        startLockCountdown(LOCKOUT_SECS);
        showError(null); // hide error, show lock
      } else {
        const remaining = MAX_ATTEMPTS - loginAttempts;
        showError(`Identifiant ou mot de passe incorrect.`);
        updateAttemptsBar(remaining);
      }
    }
  }, 600);
}

function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  showLoginScreen();
  // Clear form
  document.getElementById("login-username").value = "";
  document.getElementById("login-password").value = "";
  hideError();
  document.getElementById("attempts-text").textContent = "";
}

// ---- UI helpers ----
function setLoginLoading(on) {
  const btn  = document.getElementById("login-btn");
  const text = document.getElementById("login-btn-text");
  const icon = document.getElementById("login-btn-icon");
  if (on) {
    btn.disabled = true;
    btn.classList.add("loading");
    text.textContent = "Vérification…";
    icon.outerHTML = `<span class="spinner" id="login-btn-icon"></span>`;
  } else {
    btn.disabled = false;
    btn.classList.remove("loading");
    text.textContent = "Se connecter";
    const spinner = document.getElementById("login-btn-icon");
    if (spinner) spinner.outerHTML = `<svg id="login-btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;
  }
}

function showError(msg) {
  const errEl  = document.getElementById("login-error");
  const errMsg = document.getElementById("login-error-msg");
  const lockEl = document.getElementById("login-locked");
  if (msg) {
    errMsg.textContent = msg;
    errEl.classList.remove("hidden");
    lockEl.classList.add("hidden");
  } else {
    errEl.classList.add("hidden");
  }
}

function hideError() {
  document.getElementById("login-error").classList.add("hidden");
  document.getElementById("login-locked").classList.add("hidden");
}

function updateAttemptsBar(remaining) {
  const el = document.getElementById("attempts-text");
  if (remaining <= 1) {
    el.textContent = `⚠ Dernière tentative avant blocage !`;
    el.className = "danger";
  } else if (remaining <= 2) {
    el.textContent = `${remaining} tentative(s) restante(s) avant blocage.`;
    el.className = "warning";
  } else {
    el.textContent = `${remaining} tentative(s) restante(s).`;
    el.className = "";
  }
}

function shakeInputs() {
  const inputs = document.querySelectorAll(".login-input-wrap input");
  inputs.forEach(inp => {
    inp.classList.remove("shake");
    void inp.offsetWidth; // reflow
    inp.classList.add("shake");
  });
}

function checkLockState() {
  const now = Date.now();
  if (lockUntil > now) {
    const secs = Math.ceil((lockUntil - now) / 1000);
    startLockCountdown(secs);
  }
}

function startLockCountdown(secs) {
  const errEl  = document.getElementById("login-error");
  const lockEl = document.getElementById("login-locked");
  const timer  = document.getElementById("lock-timer");
  const btn    = document.getElementById("login-btn");
  const attEl  = document.getElementById("attempts-text");

  errEl.classList.add("hidden");
  lockEl.classList.remove("hidden");
  btn.disabled = true;
  attEl.textContent = "";

  let remaining = secs;
  timer.textContent = remaining;

  if (lockInterval) clearInterval(lockInterval);
  lockInterval = setInterval(() => {
    remaining--;
    timer.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(lockInterval);
      lockInterval = null;
      lockUntil = 0;
      localStorage.removeItem(LOCK_UNTIL_KEY);
      lockEl.classList.add("hidden");
      btn.disabled = false;
    }
  }, 1000);
}

function animateLoginSuccess(callback) {
  const card = document.querySelector(".login-card");
  card.style.transition = "transform 0.4s ease, opacity 0.4s ease";
  card.style.transform  = "scale(1.03)";
  card.style.opacity    = "0";
  setTimeout(callback, 400);
}

// ---- Password toggle ----
function togglePassword() {
  const inp   = document.getElementById("login-password");
  const open  = document.getElementById("eye-open");
  const closed= document.getElementById("eye-closed");
  const isPass = inp.type === "password";
  inp.type = isPass ? "text" : "password";
  open.style.display  = isPass ? "none"  : "block";
  closed.style.display= isPass ? "block" : "none";
}

// ---- Login particles ----
function createLoginParticles() {
  const container = document.getElementById("login-particles");
  if (!container || container.children.length > 0) return;
  for (let i = 0; i < 16; i++) {
    const p = document.createElement("div");
    p.className = "login-particle";
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      left: ${Math.random()*100}%; top: ${Math.random()*100}%;
      width: ${size}px; height: ${size}px;
      --dur: ${(Math.random()*5+4).toFixed(1)}s;
      --delay: -${(Math.random()*6).toFixed(1)}s;
    `;
    container.appendChild(p);
  }
}

// ---- DEFAULT PERFUMES (shared with site) ----
const DEFAULT_PERFUMES = [
  { id:"1", name:"Sauvage",          brand:"Dior",                      price:1250, image:"assets/perfume-sauvage.jpg",  family:"Fraîche",   concentration:"Eau de Parfum", notes:{top:["Bergamote","Poivre"],heart:["Lavande","Poivre de Sichuan"],base:["Ambroxan","Cèdre"]} },
  { id:"2", name:"Black Orchid",     brand:"Tom Ford",                  price:1950, image:"assets/perfume-tomford.jpg",  family:"Orientale", concentration:"Eau de Parfum", notes:{top:["Truffe Noire","Ylang-Ylang"],heart:["Orchidée Noire","Épices"],base:["Patchouli","Vanille"]} },
  { id:"3", name:"N°5",              brand:"Chanel",                    price:1650, image:"assets/perfume-chanel.jpg",   family:"Florale",   concentration:"Parfum",        notes:{top:["Aldéhydes","Néroli"],heart:["Jasmin","Rose de Mai"],base:["Santal","Vanille"]} },
  { id:"4", name:"Aventus",          brand:"Creed",                     price:3450, image:"assets/perfume-creed.jpg",    family:"Fraîche",   concentration:"Eau de Parfum", notes:{top:["Ananas","Cassis"],heart:["Bouleau","Patchouli"],base:["Musc","Chêne"]} },
  { id:"5", name:"La Nuit de L'Homme",brand:"Yves Saint Laurent",       price:1150, image:"assets/perfume-ysl.jpg",     family:"Boisée",    concentration:"Eau de Toilette",notes:{top:["Cardamome","Bergamote"],heart:["Cèdre","Lavande"],base:["Vétiver","Coumarine"]} },
  { id:"6", name:"Baccarat Rouge 540",brand:"Maison Francis Kurkdjian", price:3250, image:"assets/perfume-baccarat.jpg",family:"Orientale", concentration:"Extrait",       notes:{top:["Safran","Jasmin"],heart:["Ambre","Bois d'Amourette"],base:["Cèdre","Musc"]} },
];

// ---- STATE ----
let orders   = JSON.parse(localStorage.getItem("orders")   || "[]");
let products = JSON.parse(localStorage.getItem("products") || "null") || DEFAULT_PERFUMES;
let isDark   = true;
let currentTab = "orders";
let confirmCallback = null;

// ---- INIT ----
document.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "light") setTheme("light"); else setTheme("dark");

  bootAuth(); // Auth check first

  renderStats();
  renderOrders();
  renderAdminProducts();
  updateNavBadge();
});

// ---- THEME ----
function toggleTheme() { setTheme(isDark ? "light" : "dark"); }
function setTheme(t) {
  isDark = (t === "dark");
  document.body.className = t;
  localStorage.setItem("theme", t);
  document.getElementById("icon-sun").style.display  = isDark ? "block" : "none";
  document.getElementById("icon-moon").style.display = isDark ? "none"  : "block";
}

// ---- TABS ----
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.getElementById("tab-" + tab).classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
  document.getElementById("page-title").textContent =
    tab === "orders" ? "Gestion des Commandes" : "Gestion des Parfums";
}

// ---- SIDEBAR TOGGLE (mobile) ----
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

// ---- STATS ----
function renderStats() {
  const total  = orders.length;
  const pending   = orders.filter(o => o.status === "En attente").length;
  const delivered = orders.filter(o => o.status === "Livrée").length;
  const revenue = orders.filter(o => o.status !== "Annulée").reduce((s, o) => s + (o.total || 0), 0);

  document.getElementById("stats-row").innerHTML = `
    <div class="stat-card gold">
      <span class="stat-label">Chiffre d'affaires</span>
      <span class="stat-value">${revenue.toLocaleString("fr-MA")}</span>
      <span class="stat-sub">MAD (hors annulées)</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Total commandes</span>
      <span class="stat-value">${total}</span>
      <span class="stat-sub">depuis l'ouverture</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">En attente</span>
      <span class="stat-value" style="color:var(--status-pending)">${pending}</span>
      <span class="stat-sub">à traiter</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Livrées</span>
      <span class="stat-value" style="color:var(--status-delivered)">${delivered}</span>
      <span class="stat-sub">commandes terminées</span>
    </div>
  `;
}

function updateNavBadge() {
  const pending = orders.filter(o => o.status === "En attente").length;
  const badge = document.getElementById("nav-orders-badge");
  badge.textContent = pending > 0 ? pending : "";
}

// ---- ORDERS ----
function renderOrders() {
  orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const search  = (document.getElementById("order-search")?.value || "").toLowerCase();
  const status  = document.getElementById("order-filter-status")?.value || "";

  let filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search) ||
      (o.customer?.firstname + " " + o.customer?.lastname).toLowerCase().includes(search) ||
      (o.customer?.email || "").toLowerCase().includes(search);
    const matchStatus = !status || o.status === status;
    return matchSearch && matchStatus;
  });

  const tbody = document.getElementById("orders-tbody");
  const empty = document.getElementById("orders-empty");

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td><span class="order-ref">${o.id}</span></td>
      <td style="white-space:nowrap;color:var(--text-muted);font-size:.8rem">${formatDate(o.date)}</td>
      <td>
        <div style="font-size:.875rem">${o.customer?.firstname || ""} ${o.customer?.lastname || ""}</div>
        <div style="font-size:.7rem;color:var(--text-muted)">${o.customer?.email || ""}</div>
      </td>
      <td style="font-size:.8rem;color:var(--text-muted)">${(o.items || []).length} article(s)</td>
      <td style="font-family:var(--font-display);color:var(--gold)">${(o.total || 0).toLocaleString("fr-MA")} MAD</td>
      <td><span class="status-badge ${statusClass(o.status)}">${o.status}</span></td>
      <td>
        <div class="action-btns">
          <button class="tbl-btn" onclick="openOrderDetail('${o.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Détail
          </button>
          <button class="tbl-btn danger" onclick="deleteOrder('${o.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  renderStats();
  updateNavBadge();
}

function statusClass(s) {
  const map = {
    "En attente":  "s-pending",
    "Confirmée":   "s-confirmed",
    "Expédiée":    "s-shipped",
    "Livrée":      "s-delivered",
    "Annulée":     "s-cancelled",
  };
  return map[s] || "s-pending";
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-MA", { day:"2-digit", month:"2-digit", year:"numeric" })
    + " " + d.toLocaleTimeString("fr-MA", { hour:"2-digit", minute:"2-digit" });
}

function deleteOrder(id) {
  showConfirm("Supprimer la commande " + id + " définitivement ?", () => {
    orders = orders.filter(o => o.id !== id);
    localStorage.setItem("orders", JSON.stringify(orders));
    renderOrders();
    showToast("Commande supprimée", "success");
  });
}

// ---- ORDER DETAIL ----
function openOrderDetail(id) {
  const o = orders.find(o => o.id === id);
  if (!o) return;

  const items = (o.items || []).map(item => {
    const img = products.find(p => p.id === item.id)?.image || "assets/perfume-sauvage.jpg";
    return `
      <div class="detail-item-row">
        <img src="${img}" alt="${item.name}" />
        <div class="detail-item-info">
          <div class="detail-item-brand">${item.brand}</div>
          <div class="detail-item-name">${item.name}</div>
          ${item.qty > 1 ? `<div style="font-size:.7rem;color:var(--text-muted)">Qté : ${item.qty}</div>` : ""}
        </div>
        <div class="detail-item-price">${(item.price * item.qty).toLocaleString("fr-MA")} MAD</div>
      </div>`;
  }).join("");

  document.getElementById("order-detail-content").innerHTML = `
    <div class="detail-section">
      <p class="detail-section-title">Référence & Statut</p>
      <div class="detail-status-wrap">
        <span class="order-ref" style="font-size:1rem">${o.id}</span>
        <span class="status-badge ${statusClass(o.status)}">${o.status}</span>
      </div>
      <p style="font-size:.75rem;color:var(--text-muted);margin-top:6px">Passée le ${formatDate(o.date)}</p>
    </div>

    <div class="detail-section">
      <p class="detail-section-title">Changer le statut</p>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <select class="status-select" id="detail-status-${o.id}">
          ${["En attente","Confirmée","Expédiée","Livrée","Annulée"].map(s =>
            `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`
          ).join("")}
        </select>
        <button class="tbl-btn success status-save-btn" onclick="saveOrderStatus('${o.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Enregistrer
        </button>
      </div>
    </div>

    <div class="detail-section">
      <p class="detail-section-title">Client</p>
      <div class="detail-info-grid">
        <div class="detail-info-item"><label>Nom complet</label><span>${o.customer?.firstname || ""} ${o.customer?.lastname || ""}</span></div>
        <div class="detail-info-item"><label>Email</label><span>${o.customer?.email || "—"}</span></div>
        <div class="detail-info-item"><label>Téléphone</label><span>${o.customer?.phone || "—"}</span></div>
        <div class="detail-info-item"><label>Ville</label><span>${o.customer?.city || "—"}</span></div>
      </div>
      <div class="detail-info-item" style="margin-top:10px"><label>Adresse</label><span>${o.customer?.address || "—"}${o.customer?.zip ? ", " + o.customer.zip : ""}</span></div>
      ${o.customer?.note ? `<div class="detail-info-item" style="margin-top:10px"><label>Note</label><span style="color:var(--text-muted);font-style:italic">${o.customer.note}</span></div>` : ""}
    </div>

    <div class="detail-section">
      <p class="detail-section-title">Articles commandés</p>
      ${items}
      <div class="detail-total">
        <span>Total commande</span>
        <strong>${(o.total || 0).toLocaleString("fr-MA")} MAD</strong>
      </div>
    </div>
  `;

  document.getElementById("order-detail-overlay").classList.remove("hidden");
  document.getElementById("order-detail-drawer").classList.add("open");
}

function closeOrderDetail() {
  document.getElementById("order-detail-overlay").classList.add("hidden");
  document.getElementById("order-detail-drawer").classList.remove("open");
}

function saveOrderStatus(id) {
  const sel = document.getElementById("detail-status-" + id);
  if (!sel) return;
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return;
  orders[idx].status = sel.value;
  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders();
  closeOrderDetail();
  showToast("Statut mis à jour : " + sel.value, "success");
}

// ---- PRODUCTS ----
function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function renderAdminProducts() {
  const search = (document.getElementById("product-search")?.value || "").toLowerCase();
  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search)
  );

  document.getElementById("products-admin-grid").innerHTML = filtered.map(p => `
    <div class="product-admin-card">
      <img class="product-admin-img" src="${p.image || "assets/perfume-sauvage.jpg"}" alt="${p.name}" loading="lazy" />
      <div class="product-admin-body">
        <p class="product-admin-brand">${p.brand}</p>
        <h3 class="product-admin-name">${p.name}</h3>
        <div class="product-admin-meta">
          <span class="product-admin-tag">${p.family}</span>
          <span class="product-admin-tag">${p.concentration}</span>
        </div>
        <p class="product-admin-price">${p.price.toLocaleString("fr-MA")} MAD</p>
        <div class="product-admin-actions">
          <button class="tbl-btn" onclick="openProductModal('${p.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Modifier
          </button>
          <button class="tbl-btn danger" onclick="deleteProduct('${p.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function openProductModal(id) {
  document.getElementById("product-form").reset();
  if (id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    document.getElementById("product-modal-title").textContent = "Modifier le parfum";
    document.getElementById("p-id").value           = p.id;
    document.getElementById("p-name").value         = p.name;
    document.getElementById("p-brand").value        = p.brand;
    document.getElementById("p-price").value        = p.price;
    document.getElementById("p-family").value       = p.family;
    document.getElementById("p-concentration").value= p.concentration;
    document.getElementById("p-image").value        = p.image || "";
    document.getElementById("p-notes-top").value    = (p.notes?.top || []).join(", ");
    document.getElementById("p-notes-heart").value  = (p.notes?.heart || []).join(", ");
    document.getElementById("p-notes-base").value   = (p.notes?.base || []).join(", ");
    document.getElementById("p-save-btn").textContent = "Enregistrer";
  } else {
    document.getElementById("product-modal-title").textContent = "Ajouter un parfum";
    document.getElementById("p-id").value = "";
    document.getElementById("p-save-btn").textContent = "Ajouter";
  }
  document.getElementById("product-modal-overlay").classList.remove("hidden");
  document.getElementById("product-modal").classList.remove("hidden");
}

function closeProductModal() {
  document.getElementById("product-modal-overlay").classList.add("hidden");
  document.getElementById("product-modal").classList.add("hidden");
}

function saveProduct(event) {
  event.preventDefault();
  const id   = document.getElementById("p-id").value;
  const name = document.getElementById("p-name").value.trim();
  const brand= document.getElementById("p-brand").value.trim();
  const price= parseFloat(document.getElementById("p-price").value);
  const family  = document.getElementById("p-family").value;
  const conc    = document.getElementById("p-concentration").value;
  const image   = document.getElementById("p-image").value.trim() || "assets/perfume-sauvage.jpg";
  const parseNotes = val => val.split(",").map(n => n.trim()).filter(Boolean);

  const product = {
    id:    id || "p-" + Date.now().toString(36),
    name, brand, price, family,
    concentration: conc,
    image,
    notes: {
      top:   parseNotes(document.getElementById("p-notes-top").value),
      heart: parseNotes(document.getElementById("p-notes-heart").value),
      base:  parseNotes(document.getElementById("p-notes-base").value),
    },
  };

  if (id) {
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) products[idx] = product;
    showToast("Parfum modifié avec succès", "success");
  } else {
    products.push(product);
    showToast("Parfum ajouté avec succès", "success");
  }

  saveProducts();
  renderAdminProducts();
  closeProductModal();
}

function deleteProduct(id) {
  const p = products.find(pr => pr.id === id);
  showConfirm(`Supprimer "${p?.name}" définitivement ?`, () => {
    products = products.filter(pr => pr.id !== id);
    saveProducts();
    renderAdminProducts();
    showToast("Parfum supprimé", "success");
  });
}

// ---- CONFIRM DIALOG ----
function showConfirm(msg, callback) {
  confirmCallback = callback;
  document.getElementById("confirm-msg").textContent = msg;
  document.getElementById("confirm-overlay").classList.remove("hidden");
  document.getElementById("confirm-dialog").classList.remove("hidden");
  document.getElementById("confirm-ok-btn").onclick = () => {
    if (confirmCallback) confirmCallback();
    closeConfirm();
  };
}
function closeConfirm() {
  document.getElementById("confirm-overlay").classList.add("hidden");
  document.getElementById("confirm-dialog").classList.add("hidden");
  confirmCallback = null;
}

// ---- TOAST ----
function showToast(msg, type = "success") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  const icon = type === "success"
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-delivered)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-cancelled)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  toast.innerHTML = icon + msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ---- KEYBOARD ----
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeOrderDetail();
    closeProductModal();
    closeConfirm();
  }
});
