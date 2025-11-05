// script.js — product data and cart logic

/* Product + pricing data:
   Sizes: single (1), 6, 12, 24
   Prices specified in the requirements (per bouquet).
*/
const PRODUCTS = [
  { id: 'tulips', name: 'Tulips', img: 'tulips.jpg',
    prices: {1:5, 6:20, 12:40, 24:60} },
  { id: 'red_roses', name: 'Red Roses', img: 'red_roses.jpg',
    prices: {1:5, 6:20, 12:40, 24:60} },
  { id: 'yellow_roses', name: 'Yellow Roses', img: 'yellow_roses.jpg',
    prices: {1:5, 6:20, 12:40, 24:60} },
  { id: 'lilies', name: 'Lilies', img: 'lilies.jpg',
    prices: {1:6, 6:24, 12:48, 24:72} },
  { id: 'daisies', name: 'Daisies', img: 'daisies.jpg',
    prices: {1:5, 6:20, 12:40, 24:60} },
  { id: 'corsages', name: 'Corsages', img: 'corsages.jpg',
    prices: {1:15, 6:60, 12:120, 24:180} }
];

const ADDON_PRICES = { balloon:5, chocolate:7, teddy:8 };
const TAX_RATE = 0.07;

let cart = [];

/* Helper: load sample images:
   This demo expects image files named as product.img in the same folder or uses placeholders.
   If those files aren't provided, we will use external placeholder images.
*/
function resolveImage(name){
  // Prefer same-folder images (user can add images with these filenames).
  // But fallback to Unsplash images for nicer look.
  const mapping = {
    'tulips.jpg': 'img/tulips.jpg',
    'red_roses.jpg': 'img/red_roses.jpg',
    'yellow_roses.jpg': 'img/yellow_roses.jpg',
    'lilies.jpg': 'img/lilies.jpg',
    'daisies.jpg': 'img/daisies.jpg',
    'corsages.jpg': 'img/corsages.jpg'
  };
  // Return local file name if exists (we cannot check file presence here),
  // but using mapping ensures an image either way.
  return mapping[name] || mapping['tulips.jpg'];
}

/* DOM elements */
const productGrid = document.getElementById('productGrid');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartPanel = document.getElementById('cartPanel');
const overlay = document.getElementById('overlay');
const cartItemsEl = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const grandEl = document.getElementById('grandTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const closeCartBtn = document.getElementById('closeCart');
const clearCartBtn = document.getElementById('clearCart');

/* Initialize */
function init(){
  loadCart();
  renderProducts();
  updateCartUI();
  attachListeners();
}

/* Render product grid (3x2 expected) */
function renderProducts(){
  productGrid.innerHTML = '';
  PRODUCTS.forEach((p, idx) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="imgwrap">
        <img src="${resolveImage(p.img)}" alt="${p.name}" loading="lazy">
      </div>
      <div class="content">
        <h3>${p.name}</h3>
        <div class="price">From $${p.prices[1].toFixed(2)}</div>

        <div class="selects">
          <label>Size
            <select id="size-${p.id}" aria-label="Select size for ${p.name}">
              <option value="1">Single</option>
              <option value="6">6 flowers</option>
              <option value="12">12 flowers</option>
              <option value="24">24 flowers</option>
            </select>
          </label>
        </div>

        <label class="selects">Note (optional, max 100 chars)
          <textarea id="note-${p.id}" class="note" maxlength="100" placeholder="Add a short message..."></textarea>
        </label>

        <div class="extras">
          <label><input type="checkbox" id="addon-balloon-${p.id}"> 🎈 Balloon (+$${ADDON_PRICES.balloon})</label>
          <label><input type="checkbox" id="addon-choco-${p.id}"> 🍫 Box of chocolate (+$${ADDON_PRICES.chocolate})</label>
          <label><input type="checkbox" id="addon-teddy-${p.id}"> 🧸 Teddy bear (+$${ADDON_PRICES.teddy})</label>
        </div>

        <div style="margin-top:10px; display:flex; gap:8px; align-items:center;">
          <label style="font-weight:700;">Qty
            <input id="qty-${p.id}" type="number" min="1" value="1" style="width:64px;margin-left:8px;padding:6px;border-radius:6px;border:1px solid #eee">
          </label>
          <button class="btn-add" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });

  // add event listeners to Add buttons
  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      handleAddToCart(id);
    });
  });
}
function sizeLabel(size) {
  switch(size) {
    case "1": return "single";
    case "6": return "half dozen";
    case "12": return "dozen";
    case "24": return "two dozen";
    default: return size;
  }
}
/* Add selected product to cart */
function handleAddToCart(productId){
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const size= Number(document.getElementById(size-${productId}).value);
  const sizeN = sizeLabel(size);
  const note = document.getElementById(`note-${productId}`).value.trim().slice(0,100);
  const balloon = document.getElementById(`addon-balloon-${productId}`).checked;
  const choco = document.getElementById(`addon-choco-${productId}`).checked;
  const teddy = document.getElementById(`addon-teddy-${productId}`).checked;
  let qty = parseInt(document.getElementById(`qty-${productId}`).value, 10);
  if (isNaN(qty) || qty < 1) qty = 1;

  // price calculation (per bouquet)
  const base = product.prices[size];
  let addonTotal = 0;
  if (balloon) addonTotal += ADDON_PRICES.balloon;
  if (choco) addonTotal += ADDON_PRICES.chocolate;
  if (teddy) addonTotal += ADDON_PRICES.teddy;
  const price = base + addonTotal;


  // create cart item with unique id
  const item = {
    cartId: `${productId}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    productId,
    name: product.name,
    sizeN,
    qty,
    note,
    balloon, choco, teddy,
    pricePer: price
  };

  cart.push(item);
  saveCart();
  updateCartUI();
  // feedback
  alert(`${product.name} added to cart.`);
}

/* Cart rendering */
function renderCartItems(){
  cartItemsEl.innerHTML = '';
  if (cart.length === 0){
    cartItemsEl.innerHTML = `<div style="padding:18px;color:#555">Your cart is empty.</div>`;
    return;
  }

  cart.forEach((it) => {
    const p = PRODUCTS.find(x => x.id === it.productId);
    const container = document.createElement('div');
    container.className = 'cart-item';
    container.innerHTML = `
      <div class="item-thumb"><img src="${resolveImage(p.img)}" alt="${it.name}"></div>
      <div class="item-info">
        <h4>${it.name} <small style="color:#777">(${it.size})</small></h4>
        <div class="item-meta">${it.balloon ? '🎈 Balloon ' : ''}${it.choco ? '🍫 Chocolate ' : ''}${it.teddy ? '🧸 Teddy ' : ''}</div>
        <div style="font-size:13px;color:#666">${it.note ? `Note: ${escapeHtml(it.note)}` : ''}</div>
        <div class="qty-controls" style="margin-top:8px">
          <button class="qty-minus" data-id="${it.cartId}">−</button>
          <div style="min-width:28px;text-align:center;font-weight:700">${it.qty}</div>
          <button class="qty-plus" data-id="${it.cartId}">+</button>
          <button class="remove-btn" data-id="${it.cartId}" style="margin-left:12px">Delete</button>
        </div>
      </div>
      <div style="min-width:80px;text-align:right">
        <div style="font-weight:800">$${(it.pricePer * it.qty).toFixed(2)}</div>
        <div style="font-size:13px;color:#777">(${formatPrice(it.pricePer)} ea)</div>
      </div>
    `;
    cartItemsEl.appendChild(container);
  });

  // Attach qty and delete listeners
  cartItemsEl.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      changeQuantity(id, 1);
    });
  });
  cartItemsEl.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      changeQuantity(id, -1);
    });
  });
  cartItemsEl.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      removeItem(id);
    });
  });

  // disable minus when qty==1 (greyed out)
  cartItemsEl.querySelectorAll('.cart-item').forEach(el => {
    const qtyDiv = el.querySelector('.qty-controls div');
    const qty = Number(qtyDiv.textContent);
    const minusBtn = el.querySelector('.qty-minus');
    if (qty <= 1) minusBtn.classList.add('disabled'); else minusBtn.classList.remove('disabled');
  });
}

/* Utility helpers */
function formatPrice(v){ return `$${v.toFixed(2)}`; }
function escapeHtml(s){
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
}

/* Quantity change */
function changeQuantity(cartId, delta){
  const idx = cart.findIndex(i => i.cartId === cartId);
  if (idx === -1) return;
  const item = cart[idx];
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  updateCartUI();
}

/* Remove item */
function removeItem(cartId){
  cart = cart.filter(i => i.cartId !== cartId);
  saveCart();
  updateCartUI();
}

/* Totals */
function computeTotals(){
  const subtotal = cart.reduce((sum, i) => sum + (i.pricePer * i.qty), 0);
  const tax = subtotal * TAX_RATE;
  const grand = subtotal + tax;
  return { subtotal, tax, grand };
}

/* Update cart icon and panel */
function updateCartUI(){
  cartCount.textContent = cart.reduce((s,i) => s + i.qty, 0);
  renderCartItems();
  const t = computeTotals();
  subtotalEl.textContent = formatPrice(t.subtotal);
  taxEl.textContent = formatPrice(t.tax);
  grandEl.textContent = formatPrice(t.grand);
}

/* Persistence */
function saveCart(){ localStorage.setItem('petal_cart_v1', JSON.stringify(cart)); }
function loadCart(){
  const raw = localStorage.getItem('petal_cart_v1');
  if (raw){
    try{ cart = JSON.parse(raw) || []; } catch(e){ cart = []; }
  }
}

/* UI: open/close cart panel */
function openCart(){
  cartPanel.classList.add('open');
  overlay.classList.remove('hidden');
  cartPanel.setAttribute('aria-hidden','false');
}
function closeCart(){
  cartPanel.classList.remove('open');
  overlay.classList.add('hidden');
  cartPanel.setAttribute('aria-hidden','true');
}

/* Checkout and clear */
function handleCheckout(){
  if (cart.length === 0){
    alert('Your cart is empty.');
    return;
  }
  alert('Thank you for your order, you will get an email confirmation when your order is ready for pick-up');
  cart = [];
  saveCart();
  updateCartUI();
  closeCart();
}
function clearCart(){
  if (!confirm('Empty the cart?')) return;
  cart = [];
  saveCart();
  updateCartUI();
}

/* Attach listeners */
function attachListeners(){
  cartBtn.addEventListener('click', () => { openCart(); });
  closeCartBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  checkoutBtn.addEventListener('click', handleCheckout);
  clearCartBtn.addEventListener('click', clearCart);
}

/* init on DOM ready */
document.addEventListener('DOMContentLoaded', init);
