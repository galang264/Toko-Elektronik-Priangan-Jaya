/* Frontend Toko Elektronik Priangan Jaya
 * Berkomunikasi dengan Express REST API yang tersedia di prefix /api.
 * Tidak ada kredensial Supabase di browser; koneksi database tetap berada di backend.
 */
const token = localStorage.getItem('token');
let currentUser = null;
try { currentUser = JSON.parse(localStorage.getItem('user') || 'null'); } catch { currentUser = null; }

if (!token || !currentUser) window.location.replace('/login.html');

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const pageContent = $('#pageContent');
const formDialog = $('#formDialog');
const receiptDialog = $('#receiptDialog');
const dialogForm = $('#dialogForm');
let dialogHandler = null;
let activeView = 'dashboard';
let productCache = [];
let supplierCache = [];
let transactionCache = [];
let purchaseItems = [];
let cart = [];
let pendingTransactionId = sessionStorage.getItem('pendingPaymentId') || null;
let pendingTransactionTotal = Number(sessionStorage.getItem('pendingPaymentTotal') || 0);

const iconPaths = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.3"/><rect x="14" y="3" width="7" height="5" rx="1.3"/><rect x="14" y="12" width="7" height="9" rx="1.3"/><rect x="3" y="14" width="7" height="7" rx="1.3"/>',
  box: '<path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9L12 3Z"/><path d="m3.8 7.7 8.2 4.5 8.2-4.5M12 12.2V21M7.5 5.4l8.6 4.7"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  truck: '<path d="M3 6h11v12H3zM14 10h4l3 3v5h-7z"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="17.5" cy="18.5" r="1.5"/>',
  'shopping-cart': '<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l2.6 12.2a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 1.9-1.4L22 9H5"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/>',
  headphones: '<path d="M3 14v-3a9 9 0 0 1 18 0v3"/><path d="M5 14h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3v-2a2 2 0 0 1 2-2ZM19 14h-2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a3 3 0 0 0 3-3v-2a2 2 0 0 0-2-2Z"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  package: '<path d="m12 3 8 4v10l-8 4-8-4V7l8-4Z"/><path d="m4 7 8 4 8-4M12 11v10"/>',
  wallet: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M16 15h2"/><path d="M6 5V3h12v2"/>',
  alert: '<path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.5L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  printer: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6zM18 12h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  receipt: '<path d="M4 3h16v18l-3-2-3 2-3-2-3 2-4-2V3Z"/><path d="M8 8h8M8 12h8M8 16h4"/>',
};
function icon(name) { return `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.box}</svg>`; }
$$('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });

const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
const number = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0));
const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const initials = (value) => String(value || 'PJ').trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'PJ';
const dateText = (value) => value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const monthNow = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };

async function api(path, options = {}) {
  if (window.PJ_CONFIG?.demoMode === true) return window.PJDemoStore.request(path, options);
  const headers = { Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  const response = await fetch(`/api${path}`, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined });
  if (response.status === 401) {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    window.location.replace('/login.html');
    throw new Error('Sesi berakhir. Silakan masuk kembali.');
  }
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json().catch(() => ({})) : await response.text();
  if (!response.ok) throw new Error(data?.message || data || 'Permintaan gagal.');
  return data;
}

function toast(message, type = 'success') {
  const region = $('#toastRegion');
  const item = document.createElement('div');
  item.className = `toast ${type === 'error' ? 'error' : 'success'}`;
  item.textContent = message;
  region.appendChild(item);
  window.setTimeout(() => item.remove(), 3800);
}

function setLoading(message = 'Memuat data...') { pageContent.innerHTML = `<div class="page-loading"><span class="spinner"></span><span>${safe(message)}</span></div>`; }
function pageTitle(title, description, action = '') { return `<div class="page-heading"><div><span class="eyebrow">TOKO ELEKTRONIK PRIANGAN JAYA</span><h1>${title}</h1><p>${description}</p></div>${action ? `<div class="heading-actions">${action}</div>` : ''}</div>`; }
function emptyState(title, description) { return `<div class="empty-state"><strong>${safe(title)}</strong><p>${safe(description)}</p></div>`; }
function statusBadge(status) {
  const value = String(status || '').toLowerCase();
  const type = ['lunas', 'aktif', 'berhasil'].includes(value) ? 'status-success' : ['pending'].includes(value) ? 'status-warning' : ['batal', 'diklaim', 'kadaluarsa'].includes(value) ? 'status-danger' : 'status-neutral';
  return `<span class="status-pill ${type}">${safe(status || '—')}</span>`;
}

function setUserHeader() {
  $('#userName').textContent = currentUser?.nama || 'Pengguna';
  $('#userRole').textContent = currentUser?.role || 'akun';
  $('#userAvatar').textContent = initials(currentUser?.nama);
  $('#todayDate').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('#currentYear').textContent = new Date().getFullYear();
  $$('.nav-link').forEach((link) => {
    const roles = link.dataset.roles;
    if (roles && !roles.split(',').includes(currentUser?.role)) link.hidden = true;
  });
}

function openDialog({ title, eyebrow = 'FORM DATA', fields, submitText = 'Simpan data', onSubmit }) {
  $('#dialogTitle').textContent = title;
  $('#dialogEyebrow').textContent = eyebrow;
  $('#dialogFields').innerHTML = fields;
  $('#dialogSubmit').textContent = submitText;
  dialogHandler = onSubmit;
  formDialog.showModal();
}
$$('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => button.closest('dialog')?.close()));
dialogForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!dialogHandler) return;
  const button = $('#dialogSubmit');
  button.disabled = true;
  try {
    await dialogHandler(Object.fromEntries(new FormData(dialogForm)));
    formDialog.close();
  } catch (error) { toast(error.message, 'error'); }
  finally { button.disabled = false; }
});

function updateNavigation(view) {
  $$('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.view === view));
  const active = $(`.nav-link[data-view="${view}"]`);
  $('#pageCrumb').textContent = active?.querySelector('span:last-child')?.textContent || 'Ringkasan';
  activeView = view;
}

async function showView(view) {
  const link = $(`.nav-link[data-view="${view}"]`);
  if (!link || link.hidden) view = 'dashboard';
  updateNavigation(view);
  $('#sidebar').classList.remove('open');
  $('.mobile-backdrop')?.classList.remove('show');
  setLoading();
  try {
    const renderers = { dashboard: renderDashboard, produk: renderProduk, supplier: renderSupplier, pengadaan: renderPengadaan, kasir: renderKasir, riwayat: renderRiwayat, garansi: renderGaransi, laporan: renderLaporan };
    await renderers[view]();
  } catch (error) {
    pageContent.innerHTML = `<div class="panel"><div class="panel-body">${emptyState('Data belum dapat ditampilkan', error.message)}<button class="button button-soft" id="retryButton">Coba lagi</button></div></div>`;
    $('#retryButton')?.addEventListener('click', () => showView(activeView));
  }
}

async function renderDashboard() {
  const products = await api('/produk');
  productCache = Array.isArray(products) ? products : [];
  const stockUnits = productCache.reduce((total, item) => total + Number(item.stok || 0), 0);
  const lowStock = productCache.filter((item) => Number(item.stok || 0) <= 5);
  const outOfStock = productCache.filter((item) => Number(item.stok || 0) === 0).length;
  const actions = [];
  actions.push(`<button class="quick-action" data-go="produk"><span class="quick-action-icon">${icon('box')}</span><span><strong>Kelola produk</strong><small>Tambah dan perbarui katalog</small></span></button>`);
  if (currentUser.role === 'owner') {
    actions.push(`<button class="quick-action" data-go="supplier"><span class="quick-action-icon">${icon('users')}</span><span><strong>Data supplier</strong><small>Atur pemasok toko</small></span></button>`);
    actions.push(`<button class="quick-action" data-go="pengadaan"><span class="quick-action-icon">${icon('truck')}</span><span><strong>Buat pengadaan</strong><small>Catat barang masuk</small></span></button>`);
    actions.push(`<button class="quick-action" data-go="laporan"><span class="quick-action-icon">${icon('chart')}</span><span><strong>Lihat laporan</strong><small>Ekspor laporan toko</small></span></button>`);
  }
  if (currentUser.role === 'karyawan') {
    actions.push(`<button class="quick-action" data-go="kasir"><span class="quick-action-icon">${icon('shopping-cart')}</span><span><strong>Buka kasir</strong><small>Buat transaksi penjualan</small></span></button>`);
    actions.push(`<button class="quick-action" data-go="garansi"><span class="quick-action-icon">${icon('shield')}</span><span><strong>Proses garansi</strong><small>Kelola klaim pelanggan</small></span></button>`);
  }
  if (currentUser.role === 'pelanggan') actions.push(`<button class="quick-action" data-go="garansi"><span class="quick-action-icon">${icon('shield')}</span><span><strong>Layanan garansi</strong><small>Ajukan garansi transaksi</small></span></button>`);
  const stockRows = productCache.slice().sort((a, b) => Number(a.stok) - Number(b.stok)).slice(0, 6);
  pageContent.innerHTML = `${pageTitle(`Selamat datang, ${safe(currentUser.nama || 'Pengguna')}!`, 'Berikut ringkasan inventaris dan akses cepat untuk aktivitas toko hari ini.')}
    <div class="stats-grid">
      <article class="stat-card"><div class="stat-top"><span>Total jenis produk</span><span class="stat-icon blue">${icon('box')}</span></div><strong class="stat-value">${number(productCache.length)}</strong><span class="stat-note">Produk tercatat dalam katalog</span></article>
      <article class="stat-card"><div class="stat-top"><span>Total unit persediaan</span><span class="stat-icon green">${icon('package')}</span></div><strong class="stat-value">${number(stockUnits)}</strong><span class="stat-note">Akumulasi stok seluruh produk</span></article>
      <article class="stat-card"><div class="stat-top"><span>Stok perlu perhatian</span><span class="stat-icon orange">${icon('alert')}</span></div><strong class="stat-value">${number(lowStock.length)}</strong><span class="stat-note">Produk dengan stok 5 unit atau kurang</span></article>
      <article class="stat-card"><div class="stat-top"><span>Produk habis</span><span class="stat-icon red">${icon('alert')}</span></div><strong class="stat-value">${number(outOfStock)}</strong><span class="stat-note">Produk dengan stok 0 unit</span></article>
    </div>
    <div class="dashboard-grid">
      <section class="panel"><div class="panel-head"><div><h2>Perhatian persediaan</h2><p>Produk dengan jumlah stok terendah</p></div><button class="text-link" data-go="produk">Lihat semua produk →</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Kondisi</th></tr></thead><tbody>${stockRows.length ? stockRows.map((item) => `<tr><td class="product-name">${safe(item.nama_produk)}<span class="product-sub">ID #${safe(item.ID_produk)}</span></td><td>${safe(item.kategori || '—')}</td><td>${rupiah(item.harga)}</td><td class="stock-cell ${Number(item.stok) <= 5 ? 'stock-low' : 'stock-ok'}">${number(item.stok)}</td><td>${Number(item.stok) === 0 ? statusBadge('Habis') : Number(item.stok) <= 5 ? statusBadge('Menipis') : statusBadge('Aman')}</td></tr>`).join('') : `<tr><td colspan="5" class="table-empty">Belum ada data produk.</td></tr>`}</tbody></table></div></section>
      <section class="panel"><div class="panel-head"><div><h2>Akses cepat</h2><p>Pintasan sesuai hak akses akun</p></div></div><div class="panel-body"><div class="quick-actions">${actions.join('')}</div></div></section>
    </div>
    <div class="notice" style="margin-top:17px">${window.PJ_CONFIG?.demoMode ? 'Mode pratinjau aktif. Data contoh dan perubahan tersimpan di browser ini saja, bukan di database Supabase.' : 'Ringkasan menggunakan data dari REST API backend.'}</div>`;
}

async function loadProducts() {
  const data = await api('/produk');
  productCache = Array.isArray(data) ? data : [];
  return productCache;
}
function productRows(items, canManage = true) {
  if (!items.length) return `<tr><td colspan="6" class="table-empty">Tidak ada produk yang cocok.</td></tr>`;
  return items.map((item) => `<tr>
    <td class="product-name">${safe(item.nama_produk)}<span class="product-sub">ID #${safe(item.ID_produk)}</span></td><td>${safe(item.kategori || '—')}</td><td>${rupiah(item.harga)}</td><td class="stock-cell ${Number(item.stok) <= 5 ? 'stock-low' : 'stock-ok'}">${number(item.stok)}</td><td>${Number(item.stok) === 0 ? statusBadge('Habis') : Number(item.stok) <= 5 ? statusBadge('Menipis') : statusBadge('Tersedia')}</td>
    <td>${canManage ? `<div class="row-actions"><button class="mini-button" data-action="edit-product" data-id="${safe(item.ID_produk)}">Ubah</button><button class="mini-button danger" data-action="delete-product" data-id="${safe(item.ID_produk)}">Hapus</button></div>` : '<span style="color:#9aa4b3">—</span>'}</td></tr>`).join('');
}
async function renderProduk() {
  const products = await loadProducts();
  const canManage = ['owner', 'karyawan'].includes(currentUser.role);
  const action = canManage ? `<button class="button button-primary" id="addProductButton">${icon('plus')} Tambah produk</button>` : '';
  pageContent.innerHTML = `${pageTitle('Data produk', 'Kelola katalog, harga jual, kategori, dan jumlah stok.', action)}
    <div class="toolbar"><label class="search-box">${icon('search')}<input id="productSearch" type="search" placeholder="Cari nama atau kategori produk..."></label><span class="toolbar-meta" id="productCount">${number(products.length)} produk terdaftar</span></div>
    <section class="table-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Nama produk</th><th>Kategori</th><th>Harga jual</th><th>Stok</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="productTableBody">${productRows(products, canManage)}</tbody></table></div><div class="table-footer"><span>${window.PJ_CONFIG?.demoMode ? 'Data contoh tersimpan lokal di browser' : 'Data ditampilkan dari database melalui API'}</span><span>${number(products.length)} item</span></div></section>`;
  $('#productSearch').addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    const filtered = productCache.filter((item) => `${item.nama_produk} ${item.kategori || ''} ${item.ID_produk}`.toLowerCase().includes(query));
    $('#productTableBody').innerHTML = productRows(filtered, canManage);
    $('#productCount').textContent = `${number(filtered.length)} produk ditemukan`;
  });
  $('#addProductButton')?.addEventListener('click', () => productDialog());
}
function productDialog(item = null) {
  const editing = Boolean(item);
  openDialog({
    title: editing ? 'Ubah produk' : 'Tambah produk baru', eyebrow: 'DATA INVENTARIS', submitText: editing ? 'Simpan perubahan' : 'Tambah produk',
    fields: `<div class="field"><label for="nama_produk">Nama produk</label><input id="nama_produk" name="nama_produk" value="${safe(item?.nama_produk || '')}" required maxlength="120" placeholder="Contoh: Televisi LED 32 inci"></div>
      <div class="form-grid"><div class="field"><label for="kategori">Kategori</label><input id="kategori" name="kategori" value="${safe(item?.kategori || '')}" placeholder="Contoh: Televisi"></div><div class="field"><label for="harga">Harga jual (Rp)</label><input id="harga" name="harga" type="number" min="0" step="1" value="${safe(item?.harga ?? '')}" required></div></div>
      <div class="field"><label for="stok">Jumlah stok</label><input id="stok" name="stok" type="number" min="0" step="1" value="${safe(item?.stok ?? 0)}" required></div>`,
    onSubmit: async (data) => {
      const body = { nama_produk: data.nama_produk.trim(), kategori: data.kategori.trim() || null, harga: Number(data.harga), stok: Number(data.stok) };
      if (!body.nama_produk || !Number.isFinite(body.harga) || body.harga < 0 || !Number.isInteger(body.stok) || body.stok < 0) throw new Error('Periksa kembali nama, harga, dan stok produk.');
      await api(editing ? `/produk/${item.ID_produk}` : '/produk', { method: editing ? 'PUT' : 'POST', body });
      toast(editing ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.');
      await showView('produk');
    },
  });
}

async function renderSupplier() {
  const suppliers = await api('/supplier');
  supplierCache = Array.isArray(suppliers) ? suppliers : [];
  pageContent.innerHTML = `${pageTitle('Data supplier', 'Simpan dan kelola informasi pemasok barang toko.', `<button class="button button-primary" id="addSupplierButton">${icon('plus')} Tambah supplier</button>`)}
    <div class="toolbar"><div class="notice">Menu supplier hanya dapat diakses oleh akun owner.</div><span class="toolbar-meta">${number(supplierCache.length)} supplier</span></div>
    <section class="table-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Nama supplier</th><th>Kontak</th><th>ID supplier</th></tr></thead><tbody>${supplierCache.length ? supplierCache.map((supplier) => `<tr><td class="product-name">${safe(supplier.nama_supplier)}</td><td>${safe(supplier.kontak || '—')}</td><td>#${safe(supplier.ID_supplier)}</td></tr>`).join('') : `<tr><td colspan="3" class="table-empty">Belum ada supplier. Tambahkan supplier pertama untuk memulai pengadaan.</td></tr>`}</tbody></table></div><div class="table-footer"><span>Daftar pemasok</span><span>${number(supplierCache.length)} item</span></div></section>`;
  $('#addSupplierButton').addEventListener('click', () => openDialog({ title: 'Tambah supplier', eyebrow: 'DATA PEMASOK', fields: `<div class="field"><label for="nama_supplier">Nama supplier</label><input id="nama_supplier" name="nama_supplier" required placeholder="Nama perusahaan atau pemasok"></div><div class="field"><label for="kontak">Kontak</label><input id="kontak" name="kontak" placeholder="Nomor telepon atau email"></div>`, onSubmit: async (data) => { await api('/supplier', { method: 'POST', body: { nama_supplier: data.nama_supplier.trim(), kontak: data.kontak.trim() || null } }); toast('Supplier berhasil ditambahkan.'); await showView('supplier'); } }));
}

function purchaseItemRow(index) {
  const item = purchaseItems[index] || { produkId: '', jumlah: 1, harga_satuan: 0 };
  return `<div class="purchase-item" data-item-index="${index}"><div class="field"><label>Produk</label><select data-item-field="produkId" required><option value="">Pilih produk</option>${productCache.map((p) => `<option value="${safe(p.ID_produk)}" ${String(item.produkId) === String(p.ID_produk) ? 'selected' : ''}>${safe(p.nama_produk)} (stok ${number(p.stok)})</option>`).join('')}</select></div><div class="field"><label>Jumlah</label><input type="number" min="1" step="1" data-item-field="jumlah" value="${safe(item.jumlah)}" required></div><div class="field"><label>Harga beli/unit</label><input type="number" min="0" step="1" data-item-field="harga_satuan" value="${safe(item.harga_satuan)}" required></div><button class="remove-item" type="button" data-action="remove-purchase-item" data-index="${index}" aria-label="Hapus item">×</button></div>`;
}
function updatePurchaseTotal() {
  const total = purchaseItems.reduce((sum, item) => sum + Number(item.jumlah || 0) * Number(item.harga_satuan || 0), 0);
  $('#purchaseTotal').textContent = rupiah(total);
}
async function renderPengadaan() {
  const [orders, suppliers, products] = await Promise.all([api('/pengadaan'), api('/supplier'), loadProducts()]);
  supplierCache = Array.isArray(suppliers) ? suppliers : [];
  const orderRows = Array.isArray(orders) ? orders : [];
  purchaseItems = [{ produkId: '', jumlah: 1, harga_satuan: 0 }];
  pageContent.innerHTML = `${pageTitle('Pengadaan barang', 'Catat pembelian dari supplier dan perbarui stok secara otomatis.')}
    <div class="two-column">
      <section class="panel"><div class="panel-head"><div><h2>Buat pengadaan baru</h2><p>Pilih pemasok dan masukkan barang yang diterima</p></div></div><div class="panel-body"><form id="purchaseForm"><div class="field"><label for="supplierId">Supplier</label><select id="supplierId" name="supplierId" required><option value="">Pilih supplier</option>${supplierCache.map((s) => `<option value="${safe(s.ID_supplier)}">${safe(s.nama_supplier)}</option>`).join('')}</select>${supplierCache.length ? '' : '<small>Tambahkan supplier terlebih dahulu.</small>'}</div><div class="form-section-title">Daftar barang</div><div id="purchaseItemList">${purchaseItemRow(0)}</div><button class="button button-soft" type="button" id="addPurchaseItem">${icon('plus')} Tambah barang</button><div class="purchase-total"><span>Estimasi total</span><span id="purchaseTotal">Rp0</span></div><button class="button button-primary" type="submit" style="width:100%" ${!supplierCache.length || !products.length ? 'disabled' : ''}>Simpan pengadaan</button></form></div></section>
      <section class="panel"><div class="panel-head"><div><h2>Informasi pengadaan</h2><p>Catatan proses barang masuk</p></div></div><div class="panel-body"><div class="notice">Setelah pengadaan disimpan, backend akan menambahkan jumlah barang ke stok produk secara otomatis. Pastikan jumlah dan harga beli sudah benar.</div><div style="margin-top:15px" class="stat-card"><div class="stat-top"><span>Total catatan pengadaan</span><span class="stat-icon blue">${icon('truck')}</span></div><strong class="stat-value">${number(orderRows.length)}</strong><span class="stat-note">Seluruh data pengadaan yang tercatat</span></div></div></section>
    </div>
    <section class="panel" style="margin-top:17px"><div class="panel-head"><div><h2>Riwayat pengadaan</h2><p>Daftar pengadaan yang pernah dicatat</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>ID pengadaan</th><th>Tanggal pesan</th><th>Supplier</th><th>Total harga</th></tr></thead><tbody>${orderRows.length ? orderRows.map((order) => `<tr><td>#${safe(order.ID_pengadaan)}</td><td>${dateText(order.tanggal_pesan)}</td><td>${safe(order.Supplier?.nama_supplier || '—')}</td><td class="product-name">${rupiah(order.total_harga)}</td></tr>`).join('') : '<tr><td colspan="4" class="table-empty">Belum ada data pengadaan.</td></tr>'}</tbody></table></div></section>`;
  $('#addPurchaseItem').addEventListener('click', () => { purchaseItems.push({ produkId: '', jumlah: 1, harga_satuan: 0 }); $('#purchaseItemList').insertAdjacentHTML('beforeend', purchaseItemRow(purchaseItems.length - 1)); });
  $('#purchaseForm').addEventListener('input', (event) => {
    const row = event.target.closest('[data-item-index]');
    if (!row) return;
    const index = Number(row.dataset.itemIndex);
    const key = event.target.dataset.itemField;
    if (key) purchaseItems[index][key] = key === 'produkId' ? event.target.value : Number(event.target.value || 0);
    updatePurchaseTotal();
  });
  $('#purchaseForm').addEventListener('change', (event) => {
    const row = event.target.closest('[data-item-index]');
    if (!row) return;
    const index = Number(row.dataset.itemIndex);
    const key = event.target.dataset.itemField;
    if (key) purchaseItems[index][key] = key === 'produkId' ? event.target.value : Number(event.target.value || 0);
    updatePurchaseTotal();
  });
  $('#purchaseForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const supplierId = Number($('#supplierId').value);
    const items = purchaseItems.map((item) => ({ produkId: Number(item.produkId), jumlah: Number(item.jumlah), harga_satuan: Number(item.harga_satuan) }));
    if (!supplierId || items.some((item) => !item.produkId || !Number.isInteger(item.jumlah) || item.jumlah <= 0 || !Number.isFinite(item.harga_satuan) || item.harga_satuan < 0)) { toast('Lengkapi supplier dan data setiap barang.', 'error'); return; }
    const button = event.submitter; button.disabled = true;
    try { await api('/pengadaan', { method: 'POST', body: { supplierId, items } }); toast('Pengadaan berhasil disimpan dan stok telah diperbarui.'); await showView('pengadaan'); }
    catch (error) { toast(error.message, 'error'); }
    finally { button.disabled = false; }
  });
  updatePurchaseTotal();
}

function renderCart() {
  const container = $('#cartLines');
  if (!container) return;
  container.innerHTML = cart.length ? cart.map((item) => `<div class="cart-line"><div><strong>${safe(item.nama_produk)}</strong><small>${number(item.jumlah)} × ${rupiah(item.harga)}</small></div><b>${rupiah(item.jumlah * item.harga)}</b></div>`).join('') : `<div class="cart-empty">${icon('shopping-cart')}<p>Keranjang masih kosong.</p>Pilih produk untuk memulai transaksi.</div>`;
  const cartTotal = cart.reduce((sum, item) => sum + item.jumlah * item.harga, 0);
  const total = pendingTransactionId ? pendingTransactionTotal : cartTotal;
  $('#cartTotal').textContent = rupiah(total);
  $('#cartItemCount').textContent = pendingTransactionId ? `Menunggu pembayaran #${pendingTransactionId}` : `${number(cart.reduce((sum, item) => sum + item.jumlah, 0))} item`;
  const paymentInput = $('#jumlah_bayar');
  if (paymentInput && !paymentInput.dataset.userEdited) paymentInput.value = total;
  const submit = $('#checkoutButton');
  if (submit) { submit.disabled = !cart.length && !pendingTransactionId; submit.innerHTML = pendingTransactionId ? `Lanjutkan pembayaran #${safe(pendingTransactionId)} ${icon('arrow')}` : `Proses pembayaran ${icon('arrow')}`; }
}
async function renderKasir() {
  const products = await loadProducts();
  cart = [];
  const availableProducts = products.filter((p) => Number(p.stok) > 0);
  pageContent.innerHTML = `${pageTitle('Kasir penjualan', 'Pilih produk, masukkan data pelanggan, dan selesaikan pembayaran.')}
    <div class="cart-layout">
      <section class="panel"><div class="panel-head"><div><h2>Pilih produk</h2><p>Produk yang memiliki stok tersedia</p></div><span class="toolbar-meta">${number(availableProducts.length)} produk</span></div><div class="panel-body"><label class="search-box" style="margin-bottom:13px">${icon('search')}<input id="cashierSearch" type="search" placeholder="Cari produk..."></label><div class="product-picker-grid" id="productPicker">${availableProducts.length ? availableProducts.map((p) => `<button type="button" class="pick-product" data-action="add-cart" data-id="${safe(p.ID_produk)}"><strong>${safe(p.nama_produk)}</strong><span>${safe(p.kategori || 'Umum')} · Stok ${number(p.stok)}</span><b>${rupiah(p.harga)}</b></button>`).join('') : emptyState('Produk belum tersedia', 'Tambahkan produk atau stok sebelum melayani transaksi.')}</div></div></section>
      <section class="panel cart-panel"><div class="panel-head"><div><h2>Keranjang transaksi</h2><p id="cartItemCount">0 item</p></div><span class="stat-icon blue">${icon('shopping-cart')}</span></div><div class="panel-body" id="cartLines"><div class="cart-empty">Keranjang masih kosong.</div></div><div class="panel-body" style="padding-top:0"><div class="cart-total"><span>Total belanja</span><span id="cartTotal">Rp0</span></div></div><form class="cashier-form" id="checkoutForm"><div class="field"><label for="pelangganId">ID pelanggan <span style="color:#9aa4b3;font-weight:400">(opsional)</span></label><input id="pelangganId" name="pelangganId" type="number" min="1" placeholder="Masukkan ID pelanggan bila ada"></div><div class="field"><label for="metode_pembayaran">Metode pembayaran</label><select id="metode_pembayaran" name="metode_pembayaran" required><option value="Tunai">Tunai</option><option value="Transfer Bank">Transfer Bank</option><option value="QRIS">QRIS</option><option value="Debit">Kartu debit</option></select></div><div class="field"><label for="jumlah_bayar">Jumlah dibayar (Rp)</label><input id="jumlah_bayar" name="jumlah_bayar" type="number" min="0" step="1" value="0" required></div><button class="button button-primary" type="submit" id="checkoutButton" disabled>Proses pembayaran ${icon('arrow')}</button><small id="pendingPaymentNotice" style="display:block;color:#9aa4b3;font-size:9px;line-height:1.5;margin-top:9px">${window.PJ_CONFIG?.demoMode ? 'Mode demo: transaksi dan pembayaran disimulasikan di browser.' : 'Transaksi dibuat terlebih dahulu, kemudian pembayaran diproses melalui API.'}</small></form></section>
    </div>`;
  $('#cashierSearch').addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    const filtered = availableProducts.filter((p) => `${p.nama_produk} ${p.kategori || ''}`.toLowerCase().includes(query));
    $('#productPicker').innerHTML = filtered.length ? filtered.map((p) => `<button type="button" class="pick-product" data-action="add-cart" data-id="${safe(p.ID_produk)}"><strong>${safe(p.nama_produk)}</strong><span>${safe(p.kategori || 'Umum')} · Stok ${number(p.stok)}</span><b>${rupiah(p.harga)}</b></button>`).join('') : emptyState('Produk tidak ditemukan', 'Coba kata kunci pencarian lain.');
  });
  if (pendingTransactionId) $('#pendingPaymentNotice').textContent = `Transaksi #${pendingTransactionId} masih menunggu pembayaran. Masukkan jumlah pembayaran untuk melanjutkan transaksi yang sama.`;
  $('#jumlah_bayar').addEventListener('input', (event) => { event.target.dataset.userEdited = 'true'; });
  $('#checkoutForm').addEventListener('submit', checkout);
  renderCart();
}
async function checkout(event) {
  event.preventDefault();
  if (!cart.length && !pendingTransactionId) return;
  const cartValue = cart.reduce((sum, item) => sum + item.jumlah * item.harga, 0);
  const total = pendingTransactionId ? pendingTransactionTotal : cartValue;
  const amount = Number($('#jumlah_bayar').value);
  if (!Number.isFinite(amount) || amount < total) { toast('Jumlah pembayaran kurang dari total belanja.', 'error'); return; }
  const button = $('#checkoutButton'); button.disabled = true; button.textContent = 'Memproses pembayaran...';
  try {
    let trx = null;
    let transaksiId = pendingTransactionId;
    if (!transaksiId) {
      const pelangganValue = $('#pelangganId').value;
      trx = await api('/transaksi', { method: 'POST', body: { pelangganId: pelangganValue ? Number(pelangganValue) : null, items: cart.map((item) => ({ produkId: item.produkId, jumlah: item.jumlah })) } });
      transaksiId = trx.ID_transaksi || trx.id;
      if (!transaksiId) throw new Error('Transaksi dibuat tetapi ID transaksi tidak ditemukan pada respons.');
      pendingTransactionId = String(transaksiId);
      pendingTransactionTotal = total;
      sessionStorage.setItem('pendingPaymentId', pendingTransactionId);
      sessionStorage.setItem('pendingPaymentTotal', String(total));
    }
    let payment;
    try {
      payment = await api('/pembayaran', { method: 'POST', body: { transaksiId, metode_pembayaran: $('#metode_pembayaran').value, jumlah_bayar: amount } });
    } catch (paymentError) {
      toast(`Transaksi #${transaksiId} masih menunggu pembayaran: ${paymentError.message}. Coba lagi tanpa membuat transaksi baru.`, 'error');
      button.disabled = false; button.innerHTML = `Lanjutkan pembayaran #${safe(transaksiId)} ${icon('arrow')}`;
      return;
    }
    let note = null;
    try { note = await api(`/nota/${transaksiId}`, { method: 'POST' }); }
    catch (noteError) { toast(`Pembayaran berhasil. Nota belum dapat dibuat: ${noteError.message}`, 'error'); }
    showReceipt(note, trx, payment, transaksiId, total, amount);
    toast('Pembayaran berhasil diproses.');
    pendingTransactionId = null; pendingTransactionTotal = 0;
    sessionStorage.removeItem('pendingPaymentId'); sessionStorage.removeItem('pendingPaymentTotal');
    cart = [];
    await loadProducts();
    renderCart();
    $('#pelangganId').value = '';
    $('#jumlah_bayar').value = 0; delete $('#jumlah_bayar').dataset.userEdited;
    $('#productPicker').innerHTML = productCache.filter((p) => Number(p.stok) > 0).map((p) => `<button type="button" class="pick-product" data-action="add-cart" data-id="${safe(p.ID_produk)}"><strong>${safe(p.nama_produk)}</strong><span>${safe(p.kategori || 'Umum')} · Stok ${number(p.stok)}</span><b>${rupiah(p.harga)}</b></button>`).join('') || emptyState('Stok produk habis', 'Belum ada produk yang dapat dijual.');
  } catch (error) { toast(error.message, 'error'); }
  finally { if ($('#checkoutButton')) { $('#checkoutButton').disabled = !cart.length && !pendingTransactionId; $('#checkoutButton').innerHTML = pendingTransactionId ? `Lanjutkan pembayaran #${safe(pendingTransactionId)} ${icon('arrow')}` : `Proses pembayaran ${icon('arrow')}`; } }
}
function transactionRows(items) {
  if (!items.length) return '<tr><td colspan="7" class="table-empty">Belum ada transaksi pada filter ini.</td></tr>';
  return items.map((trx) => {
    const method = trx.Pembayaran?.metode_pembayaran || '—';
    const detailCount = (trx.detail || []).reduce((sum, row) => sum + Number(row.jumlah || 0), 0);
    return `<tr><td class="product-name">#${safe(trx.ID_transaksi)}<span class="product-sub">${dateText(trx.tanggal)}</span></td><td>${trx.pelangganId ? `Pelanggan #${safe(trx.pelangganId)}` : 'Pelanggan umum'}</td><td>${number(detailCount)} item</td><td class="product-name">${rupiah(trx.total_harga)}</td><td>${statusBadge(trx.status)}</td><td>${safe(method)}</td><td><button class="mini-button" data-action="view-transaction" data-id="${safe(trx.ID_transaksi)}">Detail</button></td></tr>`;
  }).join('');
}

async function renderRiwayat() {
  if (window.PJ_CONFIG?.demoMode !== true) {
    pageContent.innerHTML = `${pageTitle('Riwayat transaksi', 'Pantau transaksi penjualan dan status pembayarannya.')}<div class="panel"><div class="panel-body">${emptyState('Endpoint riwayat belum tersedia', 'Backend perlu menyediakan GET /api/transaksi untuk menampilkan daftar transaksi. Tampilan ini sudah aktif pada mode pratinjau frontend.')}</div></div>`;
    return;
  }
  const rows = await api('/transaksi');
  transactionCache = Array.isArray(rows) ? rows : [];
  const paid = transactionCache.filter((item) => item.status === 'lunas');
  const revenue = paid.reduce((sum, item) => sum + Number(item.total_harga || 0), 0);
  pageContent.innerHTML = `${pageTitle('Riwayat transaksi', 'Pantau transaksi penjualan, jumlah item, dan status pembayarannya.')}
    <div class="stats-grid">
      <article class="stat-card"><div class="stat-top"><span>Total transaksi</span><span class="stat-icon blue">${icon('receipt')}</span></div><strong class="stat-value">${number(transactionCache.length)}</strong><span class="stat-note">Seluruh transaksi demo</span></article>
      <article class="stat-card"><div class="stat-top"><span>Transaksi lunas</span><span class="stat-icon green">${icon('wallet')}</span></div><strong class="stat-value">${number(paid.length)}</strong><span class="stat-note">Pembayaran berhasil</span></article>
      <article class="stat-card"><div class="stat-top"><span>Menunggu pembayaran</span><span class="stat-icon orange">${icon('calendar')}</span></div><strong class="stat-value">${number(transactionCache.filter((item) => item.status === 'pending').length)}</strong><span class="stat-note">Transaksi belum lunas</span></article>
      <article class="stat-card"><div class="stat-top"><span>Nilai penjualan lunas</span><span class="stat-icon green">${icon('chart')}</span></div><strong class="stat-value" style="font-size:19px">${rupiah(revenue)}</strong><span class="stat-note">Akumulasi transaksi berstatus lunas</span></article>
    </div>
    <div class="toolbar"><label class="search-box">${icon('search')}<input id="transactionSearch" type="search" placeholder="Cari ID atau pelanggan..."></label><select id="transactionStatus" class="filter-select" aria-label="Filter status"><option value="semua">Semua status</option><option value="lunas">Lunas</option><option value="pending">Pending</option><option value="batal">Batal</option></select><span class="toolbar-meta" id="transactionCount">${number(transactionCache.length)} transaksi</span></div>
    <section class="table-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>ID transaksi / tanggal</th><th>Pelanggan</th><th>Item</th><th>Total</th><th>Status</th><th>Metode bayar</th><th>Aksi</th></tr></thead><tbody id="transactionTableBody">${transactionRows(transactionCache)}</tbody></table></div><div class="table-footer"><span>Daftar transaksi demo yang tersimpan di browser</span><span>${number(transactionCache.length)} transaksi</span></div></section>`;
  const applyFilter = () => {
    const query = $('#transactionSearch').value.trim().toLowerCase();
    const status = $('#transactionStatus').value;
    const filtered = transactionCache.filter((item) => {
      const matchQuery = `${item.ID_transaksi} ${item.pelangganId || 'umum'}`.toLowerCase().includes(query);
      return matchQuery && (status === 'semua' || item.status === status);
    });
    $('#transactionTableBody').innerHTML = transactionRows(filtered);
    $('#transactionCount').textContent = `${number(filtered.length)} transaksi`;
  };
  $('#transactionSearch').addEventListener('input', applyFilter);
  $('#transactionStatus').addEventListener('change', applyFilter);
}

function showReceipt(note, trx, payment, id, total, amount) {
  const transaction = note?.transaksi || trx;
  const detail = transaction?.detail || [];
  const items = detail.length ? detail.map((line) => ({ name: line.Produk?.nama_produk || `Produk #${line.produkId}`, qty: line.jumlah, subtotal: line.subtotal })) : cart.map((item) => ({ name: item.nama_produk, qty: item.jumlah, subtotal: item.jumlah * item.harga }));
  const paid = payment?.pembayaran?.jumlah_bayar ?? amount;
  const change = payment?.kembalian ?? Math.max(0, paid - total);
  $('#receiptContent').innerHTML = `<div class="receipt-brand"><h3>PRIANGAN JAYA</h3><p>TOKO ELEKTRONIK</p><p>Terima kasih telah berbelanja</p></div><div class="receipt-meta"><span>No. Transaksi: <strong>#${safe(id)}</strong></span><span>${dateText(transaction?.tanggal || new Date())}</span></div><table class="receipt-items"><tbody>${items.map((item) => `<tr><td>${safe(item.name)}<br><small style="color:#98a2b0">${number(item.qty)} × ${rupiah(item.qty ? item.subtotal / item.qty : 0)}</small></td><td>${rupiah(item.subtotal)}</td></tr>`).join('')}</tbody></table><div class="receipt-total"><span>Total</span><span>${rupiah(total)}</span></div><div class="receipt-meta"><span>Metode: ${safe(payment?.pembayaran?.metode_pembayaran || $('#metode_pembayaran')?.value || '—')}</span><span>Dibayar: ${rupiah(paid)}</span></div><div class="receipt-total" style="font-size:12px"><span>Kembalian</span><span>${rupiah(change)}</span></div><p class="receipt-note">Simpan nota ini sebagai bukti transaksi dan referensi garansi.</p>`;
  receiptDialog.showModal();
}
$('#printReceipt').addEventListener('click', () => window.print());

async function renderGaransi() {
  const customer = currentUser.role === 'pelanggan';
  pageContent.innerHTML = `${pageTitle('Layanan garansi', customer ? 'Ajukan garansi untuk transaksi yang telah lunas.' : 'Proses klaim garansi pelanggan berdasarkan ID garansi.')}
    <div class="two-column">
      ${customer ? `<section class="warranty-card"><span class="stat-icon blue" style="margin-bottom:13px">${icon('shield')}</span><h3>Ajukan garansi</h3><p>Masukkan ID transaksi yang sudah lunas dan merupakan milik akun Anda. Masa garansi yang ditetapkan backend adalah 365 hari sejak pengajuan.</p><form id="warrantyRequest"><div class="field"><label for="transaksiId">ID transaksi</label><input id="transaksiId" name="transaksiId" type="number" min="1" required placeholder="Contoh: 104"></div><button class="button button-primary" type="submit">Kirim pengajuan</button></form></section>` : ''}
      ${!customer ? `<section class="warranty-card"><span class="stat-icon orange" style="margin-bottom:13px">${icon('shield')}</span><h3>Proses klaim garansi</h3><p>Masukkan ID garansi untuk menandai klaim. Backend akan memeriksa masa berlaku garansi sebelum memperbarui status.</p><form id="warrantyClaim"><div class="field"><label for="garansiId">ID garansi</label><input id="garansiId" name="garansiId" type="number" min="1" required placeholder="Contoh: 12"></div><button class="button button-primary" type="submit">Proses klaim</button></form></section>` : ''}
      <section class="panel"><div class="panel-head"><div><h2>Ketentuan layanan</h2><p>Informasi berdasarkan aturan backend saat ini</p></div></div><div class="panel-body"><div class="quick-actions"><div class="quick-action"><span class="quick-action-icon">${icon('calendar')}</span><span><strong>Masa garansi 365 hari</strong><small>Dihitung sejak pengajuan garansi oleh pelanggan</small></span></div><div class="quick-action"><span class="quick-action-icon">${icon('receipt')}</span><span><strong>Transaksi harus lunas</strong><small>Pengajuan hanya berlaku untuk transaksi berstatus lunas</small></span></div><div class="quick-action"><span class="quick-action-icon">${icon('shield')}</span><span><strong>Satu garansi per transaksi</strong><small>Transaksi yang sama tidak dapat diajukan berulang</small></span></div></div></div></section>
    </div><div class="notice" style="margin-top:17px">${window.PJ_CONFIG?.demoMode ? 'Mode demo: akun pelanggan dapat mencoba transaksi contoh #1003. Akun karyawan dapat mencoba klaim contoh #3001.' : 'Daftar riwayat garansi memerlukan endpoint tambahan pada backend.'}</div>`;
  $('#warrantyRequest')?.addEventListener('submit', async (event) => { event.preventDefault(); const button = event.submitter; button.disabled = true; try { await api('/garansi', { method: 'POST', body: { transaksiId: Number($('#transaksiId').value) } }); toast('Pengajuan garansi berhasil dibuat.'); $('#warrantyRequest').reset(); } catch (error) { toast(error.message, 'error'); } finally { button.disabled = false; } });
  $('#warrantyClaim')?.addEventListener('submit', async (event) => { event.preventDefault(); const button = event.submitter; button.disabled = true; try { await api(`/garansi/${Number($('#garansiId').value)}/klaim`, { method: 'PATCH' }); toast('Klaim garansi berhasil diproses.'); $('#warrantyClaim').reset(); } catch (error) { toast(error.message, 'error'); } finally { button.disabled = false; } });
}

async function renderLaporan() {
  const reports = await api('/laporan');
  const data = Array.isArray(reports) ? reports : [];
  pageContent.innerHTML = `${pageTitle('Laporan toko', 'Buat laporan penjualan atau stok dan unduh hasilnya dalam format CSV.')}
    <div class="two-column"><section class="panel"><div class="panel-head"><div><h2>Buat laporan baru</h2><p>Pilih jenis laporan dan periode</p></div></div><div class="panel-body"><form id="reportForm"><div class="field"><label for="jenis_laporan">Jenis laporan</label><select id="jenis_laporan" name="jenis_laporan" required><option value="penjualan">Penjualan lunas</option><option value="stok">Persediaan stok</option></select></div><div class="field"><label for="periode">Periode laporan</label><input id="periode" name="periode" type="month" value="${monthNow()}" required><small>Gunakan format bulan dan tahun. Laporan stok menggunakan data stok saat ini.</small></div><button class="button button-primary" type="submit">${icon('plus')} Buat laporan</button></form></div></section>
    <section class="panel"><div class="panel-head"><div><h2>Ringkasan laporan</h2><p>Dokumen yang pernah dibuat oleh akun ini</p></div><span class="stat-icon blue">${icon('chart')}</span></div><div class="panel-body"><strong class="stat-value" style="margin-top:0">${number(data.length)}</strong><span class="stat-note">Laporan tercatat</span><div class="notice" style="margin-top:15px">File ekspor berupa CSV dan dapat dibuka menggunakan Microsoft Excel, Google Sheets, atau aplikasi spreadsheet lainnya.</div></div></section></div>
    <section class="panel" style="margin-top:17px"><div class="panel-head"><div><h2>Riwayat laporan</h2><p>Pilih unduh untuk mengambil file CSV</p></div></div><div class="panel-body"><div class="report-list">${data.length ? data.map((r) => `<div class="report-row"><div><strong>${r.jenis_laporan === 'penjualan' ? 'Laporan penjualan' : 'Laporan stok'}</strong><small>Periode ${safe(r.periode)} · ID #${safe(r.ID_laporan)}</small></div><button class="button button-soft" data-action="export-report" data-id="${safe(r.ID_laporan)}">Unduh CSV ${icon('arrow')}</button></div>`).join('') : emptyState('Belum ada laporan', 'Buat laporan pertama untuk menampilkan riwayat di sini.')}</div></div></section>`;
  $('#reportForm').addEventListener('submit', async (event) => { event.preventDefault(); const button = event.submitter; button.disabled = true; try { const body = Object.fromEntries(new FormData(event.currentTarget)); await api('/laporan', { method: 'POST', body }); toast('Laporan berhasil dibuat.'); await showView('laporan'); } catch (error) { toast(error.message, 'error'); } finally { button.disabled = false; } });
}

async function exportReport(id) {
  if (window.PJ_CONFIG?.demoMode === true) {
    const report = window.PJDemoStore.exportCsv(id);
    const blob = new Blob([report.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = report.filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    toast('File laporan demo berhasil diunduh.');
    return;
  }
  const response = await fetch(`/api/laporan/${encodeURIComponent(id)}/export`, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.replace('/login.html'); return; }
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || 'Gagal mengunduh laporan.'); }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `laporan-${id}.csv`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  toast('File laporan berhasil diunduh.');
}

pageContent.addEventListener('click', async (event) => {
  const go = event.target.closest('[data-go]');
  if (go) { window.location.hash = go.dataset.go; return; }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  const { action: type, id } = action.dataset;
  try {
    if (type === 'edit-product') {
      const product = productCache.find((item) => String(item.ID_produk) === String(id));
      if (product) productDialog(product);
    }
    if (type === 'delete-product') {
      const product = productCache.find((item) => String(item.ID_produk) === String(id));
      if (!product || !window.confirm(`Hapus produk "${product.nama_produk}"? Tindakan ini tidak dapat dibatalkan.`)) return;
      await api(`/produk/${id}`, { method: 'DELETE' }); toast('Produk berhasil dihapus.'); await showView('produk');
    }
    if (type === 'add-cart') {
      if (pendingTransactionId) { toast(`Selesaikan pembayaran transaksi #${pendingTransactionId} terlebih dahulu.`, 'error'); return; }
      const product = productCache.find((item) => String(item.ID_produk) === String(id));
      if (!product) return;
      const existing = cart.find((item) => item.produkId === Number(id));
      const quantity = existing?.jumlah || 0;
      if (quantity + 1 > Number(product.stok)) { toast(`Stok ${product.nama_produk} tidak mencukupi.`, 'error'); return; }
      if (existing) existing.jumlah += 1;
      else cart.push({ produkId: Number(id), nama_produk: product.nama_produk, harga: Number(product.harga), jumlah: 1 });
      renderCart();
    }
    if (type === 'remove-purchase-item') {
      purchaseItems.splice(Number(action.dataset.index), 1);
      if (!purchaseItems.length) purchaseItems.push({ produkId: '', jumlah: 1, harga_satuan: 0 });
      $('#purchaseItemList').innerHTML = purchaseItems.map((_, index) => purchaseItemRow(index)).join('');
      updatePurchaseTotal();
    }
    if (type === 'view-transaction') {
      const trx = transactionCache.find((item) => String(item.ID_transaksi) === String(id));
      if (!trx) return;
      const amount = Number(trx.Pembayaran?.jumlah_bayar || 0);
      showReceipt({ transaksi: trx }, trx, { pembayaran: trx.Pembayaran, kembalian: Math.max(0, amount - Number(trx.total_harga || 0)) }, trx.ID_transaksi, Number(trx.total_harga || 0), amount);
    }
    if (type === 'export-report') await exportReport(id);
  } catch (error) { toast(error.message, 'error'); }
});

function setupShell() {
  setUserHeader();
  $('#logoutButton').addEventListener('click', () => {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    window.location.replace('/login.html');
  });
  $('#mobileMenuButton').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
    let backdrop = $('.mobile-backdrop');
    if (!backdrop) { backdrop = document.createElement('div'); backdrop.className = 'mobile-backdrop'; document.body.appendChild(backdrop); backdrop.addEventListener('click', () => { $('#sidebar').classList.remove('open'); backdrop.classList.remove('show'); }); }
    backdrop.classList.toggle('show', $('#sidebar').classList.contains('open'));
  });
  $$('.nav-link').forEach((link) => link.addEventListener('click', () => { if (window.location.hash === link.hash) showView(link.dataset.view); }));
  window.addEventListener('hashchange', () => showView((window.location.hash || '#dashboard').slice(1)));
}

setupShell();
showView((window.location.hash || '#dashboard').slice(1));
