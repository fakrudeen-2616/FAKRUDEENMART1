/* FAKRUDEEN MART - demo front-end app (data is kept in the browser's localStorage).
   NOTE: a demo only. Real sites must hash passwords and use a server + database. */

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const STEPS = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
const imgUrl = p => `https://loremflickr.com/400/400/${p.kw}?lock=${p.id}`;   // change here for your own photos
const fallback = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#1c1c3a"/><text x="200" y="215" font-size="28" fill="#d4af37" text-anchor="middle" font-family="Arial">FAKRUDEEN MART</text></svg>');

/* ---------- database ---------- */
function seed() {
  return {
    users: [
      { id: 'admin',    email: 'admin@fakrudeenmart.com',    pass: 'admin123',    role: 'admin',    name: 'Store Admin' },
      { id: 'seller',   email: 'seller@fakrudeenmart.com',   pass: 'seller123',   role: 'seller',   name: 'Main Seller' },
      { id: 'customer', email: 'customer@fakrudeenmart.com', pass: 'customer123', role: 'customer', name: 'Demo Customer' }
    ],
    products: RAW_PRODUCTS.map((r, i) => ({ id: i + 1, cat: r[0], name: r[1], price: r[2], kw: r[3], seller: 'seller' })),
    orders: []
  };
}
let db = load('fm_db', null);
if (!db) { db = seed(); save('fm_db', db); }
const persist = () => save('fm_db', db);

let session = load('fm_session', null);           // {id, role, name}
let ui = { view: 'home', cat: 'all', sort: '', q: '', tab: 'login', err: '', sellerTab: 'orders', adminTab: 'dash' };
const cartKey = () => 'fm_cart_' + session.id;
const getCart = () => load(cartKey(), []);
const setCart = c => save(cartKey(), c);

/* ---------- helpers ---------- */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2000);
}
function nav() {
  const n = $('#nav');
  if (!session) { n.innerHTML = ''; $('#searchBox').hidden = true; return; }
  const cnt = getCart().reduce((a, i) => a + i.qty, 0);
  let h = `<span class="who">${esc(session.name)} (${session.role})</span>`;
  if (session.role === 'customer') {
    h += `<button class="nbtn ${ui.view==='home'?'active':''}" data-v="home">Shop</button>
          <button class="nbtn ${ui.view==='cart'?'active':''}" data-v="cart">Cart (${cnt})</button>
          <button class="nbtn ${ui.view==='orders'?'active':''}" data-v="orders">My Orders</button>`;
  }
  h += `<button class="nbtn" id="logoutBtn">Logout</button>`;
  n.innerHTML = h;
  $('#searchBox').hidden = !(session.role === 'customer' && ui.view === 'home');
  n.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { ui.view = b.dataset.v; render(); });
  $('#logoutBtn').onclick = () => { session = null; save('fm_session', null); ui.view = 'home'; render(); };
}
const statusBadge = o => o.cancelled ? '<span class="badge c">Cancelled</span>' : `<span class="badge">${STEPS[o.status]}</span>`;

/* ---------- views ---------- */
function render() {
  nav();
  const app = $('#app');
  if (!session) return app.innerHTML = authView(), bindAuth();
  if (session.role === 'admin') return app.innerHTML = adminView(), bindAdmin();
  if (session.role === 'seller') return app.innerHTML = sellerView(), bindSeller();
  if (ui.view === 'cart') return app.innerHTML = cartView(), bindCart();
  if (ui.view === 'checkout') return app.innerHTML = checkoutView(), bindCheckout();
  if (ui.view === 'orders') return app.innerHTML = ordersView(), bindOrders();
  app.innerHTML = shopView(); bindShop();
}

/* --- auth --- */
function authView() {
  const reg = ui.tab === 'register';
  return `
  <div class="hero"><h1>FAKRUDEEN MART</h1><p>Luxury shopping — dress, electronics, toys, courses, fashion &amp; jewelry</p></div>
  <div class="auth card">
    <div class="tabs"><button class="${!reg?'on':''}" data-t="login">Login</button><button class="${reg?'on':''}" data-t="register">Register</button></div>
    ${ui.err ? `<div class="err">${esc(ui.err)}</div>` : ''}
    ${reg ? `
      <div class="field"><label>Full name</label><input id="rName"></div>
      <div class="field"><label>User ID</label><input id="rId"></div>
      <div class="field"><label>Email</label><input id="rEmail" type="email"></div>
      <div class="field"><label>Password (min 6)</label><input id="rPass" type="password"></div>
      <div class="field"><label>Register as</label><select id="rRole"><option value="customer">Customer</option><option value="seller">Seller</option></select></div>
      <button class="btn" id="regBtn" style="width:100%">Create account</button>` : `
      <div class="field"><label>User ID or Email</label><input id="lId" value="${esc(ui.lastId || '')}" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false"></div>
      <div class="field"><label>Password</label><input id="lPass" type="password" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false">
        <button type="button" id="showPw" class="btn alt sm" style="margin-top:6px">Show password</button></div>
      <button class="btn" id="loginBtn" style="width:100%">Login</button>
      <div class="demo"><b>Demo logins</b><br>
        Admin: <code>admin</code> / <code>admin123</code><br>
        Seller: <code>seller</code> / <code>seller123</code><br>
        Customer: <code>customer</code> / <code>customer123</code></div>`}
  </div>`;
}
function bindAuth() {
  document.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { ui.tab = b.dataset.t; ui.err = ''; render(); });
  const lb = $('#loginBtn');
  if (lb) {
    const go = () => {
      const id = $('#lId').value.trim().toLowerCase(), pw = $('#lPass').value.trim();
      ui.lastId = $('#lId').value.trim();
      const u = db.users.find(u => (u.id.toLowerCase() === id || u.email.toLowerCase() === id) && u.pass === pw);
      if (!u) { ui.err = 'Wrong user ID / email or password'; return render(); }
      session = { id: u.id, role: u.role, name: u.name }; save('fm_session', session);
      ui.err = ''; ui.view = 'home'; render();
    };
    $('#showPw').onclick = () => { const p = $('#lPass'), show = p.type === 'password'; p.type = show ? 'text' : 'password'; $('#showPw').textContent = show ? 'Hide password' : 'Show password'; };
    lb.onclick = go; $('#lPass').onkeydown = e => { if (e.key === 'Enter') go(); };
  }
  const rb = $('#regBtn');
  if (rb) rb.onclick = () => {
    const name = $('#rName').value.trim(), id = $('#rId').value.trim(), email = $('#rEmail').value.trim(), pass = $('#rPass').value, role = $('#rRole').value;
    if (!name || !id || !email || pass.length < 6) { ui.err = 'Fill all fields (password min 6 chars)'; return render(); }
    if (!/^\S+@\S+\.\S+$/.test(email)) { ui.err = 'Enter a valid email'; return render(); }
    if (db.users.some(u => u.id.toLowerCase() === id.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) { ui.err = 'User ID or email already exists'; return render(); }
    db.users.push({ id, email, pass, role, name }); persist();
    ui.tab = 'login'; ui.err = ''; render(); toast('Account created — please login');
  };
}

/* --- customer: shop --- */
function filtered() {
  let list = db.products.filter(p => (ui.cat === 'all' || p.cat === ui.cat) && p.name.toLowerCase().includes(ui.q.toLowerCase()));
  if (ui.sort === 'high') list.sort((a, b) => b.price - a.price);
  if (ui.sort === 'low') list.sort((a, b) => a.price - b.price);
  return list;
}
function cardHtml(p) {
  return `<div class="prod"><div class="img"><img loading="lazy" src="${imgUrl(p)}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src='${fallback}'"></div>
    <div class="info"><span class="cat">${esc(p.cat)}</span><span class="name">${esc(p.name)}</span><span class="price">${inr(p.price)}</span>
    <button class="btn" data-add="${p.id}">Add to Cart</button></div></div>`;
}
function shopView() {
  const list = filtered();
  return `<div class="wrap">
    <div class="bar">
      <button class="chip ${ui.cat==='all'?'on':''}" data-cat="all">All</button>
      ${CATEGORIES.map(c => `<button class="chip ${ui.cat===c.id?'on':''}" data-cat="${c.id}">${c.label}</button>`).join('')}
      <select id="sortSel"><option value="">Sort by price</option><option value="high" ${ui.sort==='high'?'selected':''}>Price: High to Low</option><option value="low" ${ui.sort==='low'?'selected':''}>Price: Low to High</option></select>
    </div>
    ${list.length ? `<div class="grid">${list.map(cardHtml).join('')}</div>` : '<div class="empty">No products found.</div>'}
  </div>`;
}
function bindShop() {
  const sb = $('#searchBox'); sb.value = ui.q;
  sb.oninput = () => { ui.q = sb.value; const pos = sb.selectionStart; render(); sb.focus(); sb.setSelectionRange(pos, pos); };
  document.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { ui.cat = b.dataset.cat; render(); });
  $('#sortSel').onchange = e => { ui.sort = e.target.value; render(); };
  document.querySelectorAll('[data-add]').forEach(b => b.onclick = () => {
    const id = +b.dataset.add, c = getCart(), it = c.find(i => i.pid === id);
    it ? it.qty++ : c.push({ pid: id, qty: 1 });
    setCart(c); nav(); toast('Added to cart');
  });
}

/* --- customer: cart --- */
function cartItems() { return getCart().map(i => ({ ...i, p: db.products.find(p => p.id === i.pid) })).filter(i => i.p); }
function cartView() {
  const items = cartItems(), total = items.reduce((a, i) => a + i.p.price * i.qty, 0);
  if (!items.length) return `<div class="wrap"><div class="card empty">Your cart is empty.<br><br><button class="btn" data-v2="home">Continue shopping</button></div></div>`;
  return `<div class="wrap"><div class="card"><h2>Shopping Cart</h2>
    ${items.map(i => `<div class="cartrow"><img class="thumb" src="${imgUrl(i.p)}" onerror="this.onerror=null;this.src='${fallback}'">
      <div class="grow"><b>${esc(i.p.name)}</b><br><span class="price" style="font-size:16px">${inr(i.p.price)}</span></div>
      <div class="qty"><button data-q="-1" data-id="${i.pid}">−</button><b>${i.qty}</b><button data-q="1" data-id="${i.pid}">+</button></div>
      <b>${inr(i.p.price * i.qty)}</b><button class="btn danger sm" data-del="${i.pid}">Delete</button></div>`).join('')}
    <div class="total">Total: ${inr(total)}</div>
    <div style="text-align:right;margin-top:14px"><button class="btn" id="toCheckout">Proceed to Checkout</button></div></div></div>`;
}
function bindCart() {
  const b = document.querySelector('[data-v2]'); if (b) b.onclick = () => { ui.view = 'home'; render(); };
  document.querySelectorAll('[data-q]').forEach(x => x.onclick = () => {
    const c = getCart(), it = c.find(i => i.pid === +x.dataset.id); it.qty += +x.dataset.q;
    setCart(c.filter(i => i.qty > 0)); render();
  });
  document.querySelectorAll('[data-del]').forEach(x => x.onclick = () => { setCart(getCart().filter(i => i.pid !== +x.dataset.del)); render(); toast('Item deleted'); });
  const co = $('#toCheckout'); if (co) co.onclick = () => { ui.view = 'checkout'; render(); };
}

/* --- customer: checkout with delivery address + pin code --- */
function checkoutView() {
  const total = cartItems().reduce((a, i) => a + i.p.price * i.qty, 0);
  return `<div class="wrap"><div class="card" style="max-width:640px;margin:auto"><h2>Delivery Address</h2>
    ${ui.err ? `<div class="err">${esc(ui.err)}</div>` : ''}
    <div class="two"><div class="field"><label>Full name</label><input id="aName" value="${esc(session.name)}"></div>
    <div class="field"><label>Phone (10 digits)</label><input id="aPhone" maxlength="10"></div></div>
    <div class="field"><label>Address</label><textarea id="aAddr" rows="3"></textarea></div>
    <div class="two"><div class="field"><label>City</label><input id="aCity"></div>
    <div class="field"><label>PIN code (6 digits)</label><input id="aPin" maxlength="6"></div></div>
    <div class="field"><label>Payment</label><select id="aPay"><option>Cash on Delivery</option><option>UPI (demo)</option><option>Card (demo)</option></select></div>
    <div class="total">Payable: ${inr(total)}</div>
    <div style="text-align:right;margin-top:14px"><button class="btn alt" id="backCart">Back</button> <button class="btn" id="placeBtn">Place Order</button></div></div></div>`;
}
function bindCheckout() {
  $('#backCart').onclick = () => { ui.view = 'cart'; ui.err = ''; render(); };
  $('#placeBtn').onclick = () => {
    const f = { name: $('#aName').value.trim(), phone: $('#aPhone').value.trim(), addr: $('#aAddr').value.trim(), city: $('#aCity').value.trim(), pin: $('#aPin').value.trim(), pay: $('#aPay').value };
    const fail = m => { ui.err = m; const e = document.querySelector('.err') || document.createElement('div'); e.className = 'err'; e.textContent = m; document.querySelector('h2').after(e); };
    if (!f.name || !f.addr || !f.city) return fail('Please fill name, address and city');
    if (!/^[6-9]\d{9}$/.test(f.phone)) return fail('Enter a valid 10-digit phone number');
    if (!/^[1-9]\d{5}$/.test(f.pin)) return fail('Enter a valid 6-digit PIN code');
    const items = cartItems(); if (!items.length) return;
    const order = {
      id: 'FM' + Date.now().toString().slice(-8), user: session.id, userName: session.name,
      items: items.map(i => ({ pid: i.pid, name: i.p.name, price: i.p.price, qty: i.qty, seller: i.p.seller, cat: i.p.cat })),
      total: items.reduce((a, i) => a + i.p.price * i.qty, 0), address: f, status: 0, cancelled: false, date: new Date().toLocaleString('en-IN')
    };
    db.orders.unshift(order); persist(); setCart([]); ui.err = ''; ui.view = 'orders'; render(); toast('Order placed: ' + order.id);
  };
}

/* --- customer: orders + delivery tracking --- */
function trackHtml(o) {
  if (o.cancelled) return '<div class="err">This order was cancelled.</div>';
  return `<div class="track">${STEPS.map((s, i) => `<div class="step ${i <= o.status ? 'done' : ''}"><div class="dot">${i <= o.status ? '✓' : ''}</div>${s}</div>`).join('')}</div>`;
}
function ordersView() {
  const mine = db.orders.filter(o => o.user === session.id);
  return `<div class="wrap"><h2>My Orders &amp; Delivery Tracking</h2>
    ${mine.length ? mine.map(o => `<div class="order"><div class="head"><b>#${o.id}</b><span>${o.date}</span>${statusBadge(o)}<b>${inr(o.total)}</b></div>
      <div style="color:var(--muted);font-size:14px">${o.items.map(i => esc(i.name) + ' × ' + i.qty).join(', ')}</div>
      <div style="font-size:13px;margin-top:6px">Deliver to: ${esc(o.address.name)}, ${esc(o.address.addr)}, ${esc(o.address.city)} - <b>${esc(o.address.pin)}</b></div>
      ${trackHtml(o)}
      ${(!o.cancelled && o.status < 2) ? `<button class="btn danger sm" data-cancel="${o.id}">Cancel order</button>` : ''}</div>`).join('') : '<div class="card empty">No orders yet.</div>'}</div>`;
}
function bindOrders() {
  document.querySelectorAll('[data-cancel]').forEach(b => b.onclick = () => {
    const o = db.orders.find(o => o.id === b.dataset.cancel); o.cancelled = true; persist(); render(); toast('Order cancelled');
  });
}

/* --- seller dashboard: orders, products --- */
function statusSelect(o) {
  return `<select data-st="${o.id}" ${o.cancelled ? 'disabled' : ''}>${STEPS.map((s, i) => `<option value="${i}" ${o.status === i ? 'selected' : ''}>${s}</option>`).join('')}</select>`;
}
function orderTable(orders, sellerId) {
  if (!orders.length) return '<div class="card empty">No orders yet.</div>';
  return `<div class="card tblwrap"><table><tr><th>Order</th><th>Customer</th><th>Items</th><th>Ship to (PIN)</th><th>Total</th><th>Status</th></tr>
    ${orders.map(o => {
      const its = sellerId ? o.items.filter(i => i.seller === sellerId) : o.items;
      const tot = its.reduce((a, i) => a + i.price * i.qty, 0);
      return `<tr><td>#${o.id}<br><small>${o.date}</small></td><td>${esc(o.userName)}</td><td>${its.map(i => esc(i.name) + ' × ' + i.qty).join('<br>')}</td>
      <td>${esc(o.address.city)} - ${esc(o.address.pin)}</td><td>${inr(tot)}</td><td>${o.cancelled ? '<span class="badge c">Cancelled</span>' : statusSelect(o)}</td></tr>`;
    }).join('')}</table></div>`;
}
function bindStatus() {
  document.querySelectorAll('[data-st]').forEach(s => s.onchange = () => {
    db.orders.find(o => o.id === s.dataset.st).status = +s.value; persist(); toast('Status updated'); render();
  });
}
function sellerView() {
  const mineOrders = db.orders.filter(o => o.items.some(i => i.seller === session.id));
  const myProds = db.products.filter(p => p.seller === session.id);
  const tab = ui.sellerTab;
  return `<div class="wrap"><div class="tabs" style="max-width:420px"><button class="${tab==='orders'?'on':''}" data-stab="orders">Order List</button><button class="${tab==='products'?'on':''}" data-stab="products">My Products</button></div>
  ${tab === 'orders' ? `<h2>Order List</h2>${orderTable(mineOrders, session.id)}` : `
    <h2>Add Product</h2><div class="card"><div class="two">
      <div class="field"><label>Name</label><input id="pName"></div><div class="field"><label>Price (₹)</label><input id="pPrice" type="number" min="1"></div>
      <div class="field"><label>Category</label><select id="pCat">${CATEGORIES.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}</select></div>
      <div class="field"><label>Image keyword (e.g. watch)</label><input id="pKw"></div></div>
      <button class="btn" id="addProd">Add Product</button></div>
    <h2>My Products (${myProds.length})</h2>
    <div class="card tblwrap"><table><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th></th></tr>
    ${myProds.map(p => `<tr><td><img class="thumb" src="${imgUrl(p)}" onerror="this.onerror=null;this.src='${fallback}'"></td><td>${esc(p.name)}</td><td>${p.cat}</td><td>${inr(p.price)}</td><td><button class="btn danger sm" data-dp="${p.id}">Delete</button></td></tr>`).join('')}</table></div>`}
  </div>`;
}
function bindProductForms() {
  const ap = $('#addProd');
  if (ap) ap.onclick = () => {
    const name = $('#pName').value.trim(), price = +$('#pPrice').value, kw = $('#pKw').value.trim().replace(/\s+/g, '') || 'product';
    if (!name || !(price > 0)) return toast('Enter name and price');
    db.products.push({ id: Math.max(0, ...db.products.map(p => p.id)) + 1, cat: $('#pCat').value, name, price, kw, seller: session.id });
    persist(); render(); toast('Product added');
  };
  document.querySelectorAll('[data-dp]').forEach(b => b.onclick = () => { db.products = db.products.filter(p => p.id !== +b.dataset.dp); persist(); render(); toast('Product deleted'); });
}
function bindSeller() {
  document.querySelectorAll('[data-stab]').forEach(b => b.onclick = () => { ui.sellerTab = b.dataset.stab; render(); });
  bindStatus(); bindProductForms();
}

/* --- admin dashboard --- */
function adminView() {
  const live = db.orders.filter(o => !o.cancelled);
  const revenue = live.reduce((a, o) => a + o.total, 0);
  const byCat = CATEGORIES.map(c => ({ label: c.label, v: live.reduce((a, o) => a + o.items.filter(i => i.cat === c.id).reduce((s, i) => s + i.price * i.qty, 0), 0) }));
  const max = Math.max(1, ...byCat.map(x => x.v));
  const tab = ui.adminTab;
  let body = '';
  if (tab === 'dash') body = `
    <div class="stats">
      <div class="stat"><small>Total Revenue</small><b>${inr(revenue)}</b></div>
      <div class="stat"><small>Orders</small><b>${db.orders.length}</b></div>
      <div class="stat"><small>Products</small><b>${db.products.length}</b></div>
      <div class="stat"><small>Users</small><b>${db.users.length}</b></div></div>
    <div class="card"><h2>Revenue by Category</h2>${byCat.map(x => `<div class="barrow"><span class="lbl">${x.label}</span><div class="btrack"><div class="fill" style="width:${x.v / max * 100}%"></div></div><b>${inr(x.v)}</b></div>`).join('')}</div>`;
  if (tab === 'products') body = `<h2>Product Details</h2><div class="card tblwrap"><table><tr><th></th><th>ID</th><th>Name</th><th>Category</th><th>Seller</th><th>Price</th><th></th></tr>
    ${db.products.map(p => `<tr><td><img class="thumb" src="${imgUrl(p)}" onerror="this.onerror=null;this.src='${fallback}'"></td><td>${p.id}</td><td>${esc(p.name)}</td><td>${p.cat}</td><td>${esc(p.seller)}</td><td>${inr(p.price)}</td><td><button class="btn danger sm" data-dp="${p.id}">Delete</button></td></tr>`).join('')}</table></div>`;
  if (tab === 'orders') body = `<h2>All Orders</h2>${orderTable(db.orders)}`;
  if (tab === 'users') body = `<h2>Users</h2><div class="card tblwrap"><table><tr><th>User ID</th><th>Name</th><th>Email</th><th>Role</th><th></th></tr>
    ${db.users.map(u => `<tr><td>${esc(u.id)}</td><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${u.role}</td><td>${['admin','seller','customer'].includes(u.id) ? '' : `<button class="btn danger sm" data-du="${esc(u.id)}">Delete</button>`}</td></tr>`).join('')}</table></div>`;
  return `<div class="wrap"><h2>Admin Dashboard</h2><div class="bar">
    ${[['dash','Dashboard'],['products','Products'],['orders','Orders'],['users','Users']].map(t => `<button class="chip ${tab===t[0]?'on':''}" data-atab="${t[0]}">${t[1]}</button>`).join('')}</div>${body}</div>`;
}
function bindAdmin() {
  document.querySelectorAll('[data-atab]').forEach(b => b.onclick = () => { ui.adminTab = b.dataset.atab; render(); });
  document.querySelectorAll('[data-du]').forEach(b => b.onclick = () => { db.users = db.users.filter(u => u.id !== b.dataset.du); persist(); render(); toast('User deleted'); });
  bindStatus(); bindProductForms();
}

/* ---------- Help & Support chatbot ---------- */
const bot = [
  [/track|where.*order|status/, 'To track an order open "My Orders" — you will see the live delivery steps. Or type your order ID (e.g. FM12345678) here.'],
  [/cancel/, 'You can cancel an order from "My Orders" until it is shipped.'],
  [/return|refund|exchange/, 'Returns are accepted within 7 days of delivery. Refunds go back to your original payment method in 3–5 working days.'],
  [/pay|upi|card|cod|cash/, 'We accept Cash on Delivery, UPI and Card (demo checkout).'],
  [/pin|address|deliver/, 'Enter your 6-digit PIN code and full address at checkout. Standard delivery takes 3–7 days.'],
  [/cart|delete|remove/, 'Use "Add to Cart" on any product. In the Cart you can change quantity or press Delete to remove an item.'],
  [/price|sort|cheap|costly|high/, 'On the Shop page use the "Sort by price" menu for High to Low or Low to High.'],
  [/seller|sell/, 'Register with the role "Seller" to add products and manage orders.'],
  [/login|password|account|forgot/, 'Use your User ID or email with your password. Need a new account? Choose Register.'],
  [/hi|hello|hey|help/, 'Hello! I can help with tracking, returns, payment, delivery and your account. What do you need?'],
  [/thank/, 'You are welcome! Happy shopping at FAKRUDEEN MART.']
];
function say(text, who) {
  const d = document.createElement('div'); d.className = 'msg ' + who; d.textContent = text;
  $('#chatLog').append(d); $('#chatLog').scrollTop = 1e9;
}
function botReply(t) {
  const m = t.match(/FM\d{8}/i);
  if (m) {
    const o = db.orders.find(o => o.id.toUpperCase() === m[0].toUpperCase());
    return o ? `Order #${o.id}: ${o.cancelled ? 'Cancelled' : STEPS[o.status]}. Total ${inr(o.total)}, delivering to PIN ${o.address.pin}.` : 'I could not find that order ID. Please check and try again.';
  }
  const l = t.toLowerCase(), hit = bot.find(b => b[0].test(l));
  return hit ? hit[1] : 'Sorry, I did not get that. Try: track order, return, payment, delivery, cart or account. For anything else email support@fakrudeenmart.com';
}
function send() {
  const i = $('#chatText'), t = i.value.trim(); if (!t) return;
  say(t, 'me'); i.value = ''; setTimeout(() => say(botReply(t), 'bot'), 350);
}
$('#chatFab').onclick = () => { const b = $('#chatBox'); b.hidden = !b.hidden; if (!b.hidden && !$('#chatLog').children.length) say('Hi! Welcome to FAKRUDEEN MART support. How can I help you?', 'bot'); };
$('#chatClose').onclick = () => $('#chatBox').hidden = true;
$('#chatSend').onclick = send;
$('#chatText').onkeydown = e => { if (e.key === 'Enter') send(); };
$('#brandBtn').onclick = () => { if (session && session.role === 'customer') { ui.view = 'home'; render(); } };

render();