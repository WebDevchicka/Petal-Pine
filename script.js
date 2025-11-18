// script.js — product data and cart logic

/* Product + pricing data:
   Sizes: single (1), 6, 12, 24
*/
const PRODUCTS = [
  { id: 'tulips', name: 'Tulips', img: 'tulips.jpg', prices: {1:5, 6:20, 12:40, 24:60} },
  { id: 'red_roses', name: 'Red Roses', img: 'red_roses.jpg', prices: {1:5, 6:20, 12:40, 24:60} },
  { id: 'yellow_roses', name: 'Yellow Roses', img: 'yellow_roses.jpg', prices: {1:5, 6:20, 12:40, 24:60} },
  { id: 'lilies', name: 'Lilies', img: 'lilies.jpg', prices: {1:6, 6:24, 12:48, 24:72} },
  { id: 'daisies', name: 'Daisies', img: 'daisies.jpg', prices: {1:5, 6:20, 12:40, 24:60} },
  { id: 'corsages', name: 'Corsages', img: 'corsages.jpg', prices: {1:15, 6:60, 12:120, 24:180} }
];

const ADDON_PRICES = { balloon:5, chocolate:7, teddy:8 };
const TAX_RATE = 0.07;
let cart = [];

/* Helper: resolve image paths */
function resolveImage(name){
  return `img/${name}`;
}

/* DOM elements (script is loaded at end of body so elements exist) */
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

/* Init */
document.addEventListener('DOMContentLoaded', init);
function init(){
  loadCart();
  renderProducts();
  updateCartUI();
  attachListeners();
}

/* Render product cards */
function renderProducts(){
  productGrid.innerHTML = '';
  PRODUCTS.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="imgwrap">
        <img src="${resolveImage(p.img)}" alt="${p.name}">
      </div>
      <h3>${p.name}</h3>
      <div class="price">From $${p.prices[1].toFixed(2)}</div>

      <label>Size
        <select id="size-${p.id}">
          <option value="1">Single</option>
          <option value="6">Half Dozen (6)</option>
          <option value="12">Dozen (12)</option>
          <option value="24">Two Dozen (24)</option>
        </select>
      </label>

      <label>Note (optional)
        <textarea id="note-${p.id}" maxlength="100"></textarea>
      </label>

      <label><input type="checkbox" id="addon-balloon-${p.id}"> 🎈 Balloon (+$5)</label>
      <label><input type="checkbox" id="addon-choco-${p.id}"> 🍫 Chocolate (+$7)</label>
      <label><input type="checkbox" id="addon-teddy-${p.id}"> 🧸 Teddy Bear (+$8)</label>

      <label>Qty
        <input id="qty-${p.id}" type="number" min="1" value="1">
      </label>

      <button class="btn-add" data-id="${p.id}">Add to Cart</button>
    `;
    productGrid.appendChild(card);
  });

  document.querySelectorAll('.btn-add').forEach(btn =>
    btn.addEventListener('click', () => handleAddToCart(btn.dataset.id))
  );
}

/* Size label formatter */
function sizeLabel(size){
  return {
    1: "single",
    6: "half dozen",
    12: "dozen",
    24: "two dozen"
  }[Number(size)] || size;
}

/* Add to cart */
function handleAddToCart(productId){
  const product = PRODUCTS.find(p => p.id === productId);
  const sizeValue = document.getElementById(`size-${productId}`).value;
  const note = document.getElementById(`note-${productId}`).value.trim();
  const balloon = document.getElementById(`addon-balloon-${productId}`).checked;
  const choco = document.getElementById(`addon-choco-${productId}`).checked;
  const teddy = document.getElementById(`addon-teddy-${productId}`).checked;
  let qty = parseInt(document.getElementById(`qty-${productId}`).value);
  if (qty < 1) qty = 1;

  const basePrice = product.prices[sizeValue];
  let addons = (balloon ? 5 : 0) + (choco ? 7 : 0) + (teddy ? 8 : 0);
  const pricePer = basePrice + addons;

  cart.push({
    cartId: Date.now() + Math.random(),
    productId,
    name: product.name,
    size: sizeLabel(sizeValue),
    qty,
    note,
    balloon, choco, teddy,
    pricePer
  });

  saveCart();
  updateCartUI();
  alert(`${product.name} (${sizeLabel(sizeValue)}) added to cart!`);
}

/* Render cart contents */
function renderCartItems(){
  cartItemsEl.innerHTML = '';
  if (cart.length === 0){
    cartItemsEl.innerHTML = `<p>Your cart is empty.</p>`;
    return;
  }

  cart.forEach(item => {
   const product = PRODUCTS.find(p => p.id === item.productId);
     
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="thumb-wrap">
         <img src="${resolveImage(product.img)}" class="thumb" alt="${item.name}">
      </div>
      <div class="cart-info">
         <strong>${item.name}</strong> (${item.size})<br>
         Qty: ${item.qty}<br>
         ${item.balloon ? '🎈 ' : ''}${item.choco ? '🍫 ' : ''}${item.teddy ? '🧸 ' : ''}
         <br>$${(item.pricePer * item.qty).toFixed(2)}
         <button class="remove-btn" data-id="${item.cartId}">Remove</button>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });

  document.querySelectorAll('.remove-btn').forEach(btn =>
    btn.addEventListener('click', () => removeItem(btn.dataset.id))
  );
}

/* Cart totals */
function computeTotals(){
  let subtotal = cart.reduce((sum, i) => sum + i.pricePer * i.qty, 0);
  let tax = subtotal * TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
}

function updateCartUI(){
  cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
  renderCartItems();
  const t = computeTotals();
  subtotalEl.textContent = `$${t.subtotal.toFixed(2)}`;
  taxEl.textContent = `$${t.tax.toFixed(2)}`;
  grandEl.textContent = `$${t.total.toFixed(2)}`;
}

function saveCart(){ localStorage.setItem('petal_cart', JSON.stringify(cart)); }
function loadCart(){ cart = JSON.parse(localStorage.getItem('petal_cart')) || []; }

function removeItem(id){
  cart = cart.filter(i => i.cartId != id);
  saveCart();
  updateCartUI();
}

/* Cart UI open/close */
function attachListeners(){
  cartBtn.addEventListener('click', () => {
    cartPanel.classList.add('open');
    overlay.classList.remove('hidden');
  });

  closeCartBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  checkoutBtn.addEventListener('click', handleCheckout);
  clearCartBtn.addEventListener('click', clearCart);
}

function closeCart(){
  cartPanel.classList.remove('open');
  overlay.classList.add('hidden');
}

function handleCheckout(){
  if (!cart.length) return alert("Your cart is empty.");
  alert("Thank you for your order!");
  cart = [];
  saveCart();
  updateCartUI();
  closeCart();
}

function clearCart(){
  if (confirm("Empty the cart?")){
    cart = [];
    saveCart();
    updateCartUI();
  }
}
