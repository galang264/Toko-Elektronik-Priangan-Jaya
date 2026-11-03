/*
 * Adapter data demo untuk frontend Priangan Jaya.
 * Seluruh data disimpan di localStorage browser; tidak terhubung ke backend/database.
 * Bentuk respons sengaja dibuat menyerupai REST API Express agar mudah diganti nanti.
 */
(() => {
  const DB_KEY = 'pj_demo_database_v1';
  const USERS_KEY = 'pj_demo_users_v1';

  const seedUsers = [
    { ID_user: 1, nama: 'Administrator Priangan', email: 'owner@prianganjaya.test', username: 'owner', password: 'owner123', role: 'owner' },
    { ID_user: 2, nama: 'Rizki Karyawan', email: 'karyawan@prianganjaya.test', username: 'karyawan', password: 'karyawan123', role: 'karyawan' },
    { ID_user: 3, nama: 'Nadia Pelanggan', email: 'pelanggan@prianganjaya.test', username: 'pelanggan', password: 'pelanggan123', role: 'pelanggan' }
  ];

  const initialDB = () => {
    const today = new Date();
    const dateOnly = (value) => value.toISOString().slice(0, 10);
    const earlier = new Date(today); earlier.setDate(today.getDate() - 12);
    const end = new Date(today); end.setDate(today.getDate() + 353);
    const products = [
      { ID_produk: 1, nama_produk: 'Samsung Smart TV 43 Inch', kategori: 'Televisi', harga: 5699000, stok: 8 },
      { ID_produk: 2, nama_produk: 'LG Kulkas 2 Pintu', kategori: 'Kulkas', harga: 4899000, stok: 5 },
      { ID_produk: 3, nama_produk: 'Xiaomi TV A Pro 32 Inch', kategori: 'Televisi', harga: 3299000, stok: 3 },
      { ID_produk: 4, nama_produk: 'Panasonic AC Inverter 1 PK', kategori: 'Pendingin Ruangan', harga: 4250000, stok: 0 },
      { ID_produk: 5, nama_produk: 'JBL Go 4 Bluetooth Speaker', kategori: 'Audio', harga: 599000, stok: 14 },
      { ID_produk: 6, nama_produk: 'Philips Blender Series 5000', kategori: 'Peralatan Dapur', harga: 425000, stok: 7 },
      { ID_produk: 7, nama_produk: 'Logitech Wireless Mouse M331', kategori: 'Aksesori Komputer', harga: 189000, stok: 22 },
      { ID_produk: 8, nama_produk: 'Lenovo IdeaPad Slim 3', kategori: 'Laptop', harga: 7999000, stok: 2 },
      { ID_produk: 9, nama_produk: 'Samsung Galaxy A55 5G', kategori: 'Ponsel', harga: 5499000, stok: 11 },
      { ID_produk: 10, nama_produk: 'Epson Printer EcoTank L3210', kategori: 'Printer', harga: 2150000, stok: 6 }
    ];
    const suppliers = [
      { ID_supplier: 1, nama_supplier: 'PT Sumber Elektronik Bandung', kontak: '022-6012-880' },
      { ID_supplier: 2, nama_supplier: 'CV Mitra Teknologi Nusantara', kontak: '0812-9000-1122' },
      { ID_supplier: 3, nama_supplier: 'Global Audio Distribution', kontak: 'sales@globalaudio.test' }
    ];
    const completedDetail = [
      { produkId: 9, jumlah: 1, subtotal: 5499000, Produk: products[8] },
      { produkId: 5, jumlah: 1, subtotal: 599000, Produk: products[4] }
    ];
    return {
      products,
      suppliers,
      purchases: [
        { ID_pengadaan: 501, tanggal_pesan: dateOnly(earlier), supplierId: 1, total_harga: 15400000, Supplier: suppliers[0] }
      ],
      transactions: [
        { ID_transaksi: 1001, tanggal: dateOnly(earlier), pelangganId: 3, karyawanId: 2, total_harga: 6098000, status: 'lunas', detail: completedDetail,
          Pembayaran: { ID_pembayaran: 7001, metode_pembayaran: 'QRIS', jumlah_bayar: 6098000, tanggal_bayar: dateOnly(earlier) },
          Nota: { ID_nota: 8001, tanggal_cetak: dateOnly(earlier) } },
        { ID_transaksi: 1002, tanggal: dateOnly(today), pelangganId: null, karyawanId: 2, total_harga: 599000, status: 'lunas',
          detail: [{ produkId: 5, jumlah: 1, subtotal: 599000, Produk: products[4] }],
          Pembayaran: { ID_pembayaran: 7002, metode_pembayaran: 'Tunai', jumlah_bayar: 600000, tanggal_bayar: dateOnly(today) },
          Nota: { ID_nota: 8002, tanggal_cetak: dateOnly(today) } },
        { ID_transaksi: 1003, tanggal: dateOnly(today), pelangganId: 3, karyawanId: 2, total_harga: 189000, status: 'lunas',
          detail: [{ produkId: 7, jumlah: 1, subtotal: 189000, Produk: products[6] }],
          Pembayaran: { ID_pembayaran: 7003, metode_pembayaran: 'QRIS', jumlah_bayar: 189000, tanggal_bayar: dateOnly(today) },
          Nota: { ID_nota: 8003, tanggal_cetak: dateOnly(today) } }
      ],
      warranties: [
        { ID_garansi: 3001, transaksiId: 1001, pelangganId: 3, tanggal_mulai: dateOnly(earlier), tanggal_akhir: dateOnly(end), status: 'aktif' }
      ],
      reports: [
        { ID_laporan: 9001, ownerId: 1, jenis_laporan: 'stok', periode: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}` }
      ],
      counters: { product: 11, supplier: 4, purchase: 502, transaction: 1004, payment: 7004, note: 8004, warranty: 3002, report: 9002 }
    };
  };

  function read(key, fallback) {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function db() {
    let value = read(DB_KEY, null);
    if (!value) { value = initialDB(); write(DB_KEY, value); }
    return value;
  }
  function users() {
    let value = read(USERS_KEY, null);
    if (!value) { value = seedUsers; write(USERS_KEY, value); }
    return value;
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function currentUser() { return read('user', null); }
  function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
  function today() { return new Date().toISOString().slice(0, 10); }
  function nextId(data, key) { const id = data.counters[key]; data.counters[key] += 1; return id; }
  function attachTransaction(data, transaction) {
    const detail = (transaction.detail || []).map((line) => ({ ...line, Produk: data.products.find((product) => product.ID_produk === line.produkId) || line.Produk }));
    return { ...transaction, detail };
  }

  async function auth(endpoint, body) {
    const accountList = users();
    if (endpoint === 'register') {
      const { nama, email, username, password } = body;
      if (!nama || nama.trim().length < 3 || !email || !/^\S+@\S+\.\S+$/.test(email) || !/^[a-zA-Z0-9_]{4,20}$/.test(username || '') || (password || '').length < 6) fail('Periksa kembali nama, email, username, dan password.');
      if (accountList.some((item) => item.username.toLowerCase() === username.toLowerCase() || item.email.toLowerCase() === email.toLowerCase())) fail('Username atau email sudah digunakan.', 409);
      const user = { ID_user: Math.max(0, ...accountList.map((item) => item.ID_user)) + 1, nama: nama.trim(), email: email.trim(), username, password, role: 'pelanggan' };
      accountList.push(user); write(USERS_KEY, accountList);
      return { message: 'Registrasi demo berhasil. Silakan masuk menggunakan akun yang baru dibuat.', user: { ID_user: user.ID_user, nama: user.nama, username: user.username, role: user.role } };
    }
    if (endpoint === 'login') {
      const user = accountList.find((item) => item.username.toLowerCase() === String(body.username || '').toLowerCase() && item.password === body.password);
      if (!user) fail('Username atau password tidak sesuai.', 401);
      return { token: `demo-token-${user.ID_user}`, user: { ID_user: user.ID_user, id: user.ID_user, nama: user.nama, role: user.role, username: user.username } };
    }
    if (endpoint === 'lupa-password') {
      const user = accountList.find((item) => item.email.toLowerCase() === String(body.email || '').toLowerCase());
      if (!user) fail('Email belum terdaftar pada data demo.', 404);
      const resetToken = `demo-${Date.now()}-${user.ID_user}`;
      user.resetToken = resetToken; write(USERS_KEY, accountList);
      return { message: `Mode demo: simulasi tautan reset dibuat. Token demo: ${resetToken}` };
    }
    if (endpoint === 'reset-password') {
      const user = accountList.find((item) => item.resetToken === body.token);
      if (!user) fail('Token demo tidak ditemukan. Buat permintaan reset password kembali.');
      if ((body.passwordBaru || '').length < 6) fail('Password minimal 6 karakter.');
      user.password = body.passwordBaru; delete user.resetToken; write(USERS_KEY, accountList);
      return { message: 'Password demo berhasil diubah.' };
    }
    fail('Aksi autentikasi demo tidak dikenal.', 404);
  }

  async function request(path, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const body = options.body || {};
    const cleanPath = path.split('?')[0].replace(/^\/+|\/+$/g, '');
    const parts = cleanPath.split('/').filter(Boolean);
    const data = db();
    const user = currentUser();

    if (parts[0] === 'produk') {
      if (method === 'GET' && parts.length === 1) return clone(data.products);
      if (method === 'POST') {
        const item = { ID_produk: nextId(data, 'product'), nama_produk: String(body.nama_produk || '').trim(), kategori: body.kategori || null, harga: Number(body.harga), stok: Number(body.stok) };
        if (!item.nama_produk || !Number.isFinite(item.harga) || item.harga < 0 || !Number.isInteger(item.stok) || item.stok < 0) fail('Data produk tidak valid.');
        data.products.push(item); write(DB_KEY, data); return clone(item);
      }
      const id = Number(parts[1]); const index = data.products.findIndex((item) => item.ID_produk === id);
      if (index < 0) fail('Produk tidak ditemukan.', 404);
      if (method === 'PUT') { data.products[index] = { ...data.products[index], ...body, ID_produk: id }; write(DB_KEY, data); return clone(data.products[index]); }
      if (method === 'DELETE') { data.products.splice(index, 1); write(DB_KEY, data); return { message: 'Produk demo dihapus.' }; }
    }

    if (parts[0] === 'supplier') {
      if (method === 'GET' && parts.length === 1) return clone(data.suppliers);
      if (method === 'POST') {
        const item = { ID_supplier: nextId(data, 'supplier'), nama_supplier: String(body.nama_supplier || '').trim(), kontak: body.kontak || null };
        if (!item.nama_supplier) fail('Nama supplier wajib diisi.');
        data.suppliers.push(item); write(DB_KEY, data); return clone(item);
      }
    }

    if (parts[0] === 'pengadaan') {
      if (method === 'GET') return clone(data.purchases.map((order) => ({ ...order, Supplier: data.suppliers.find((item) => item.ID_supplier === order.supplierId) || order.Supplier })));
      if (method === 'POST') {
        const supplier = data.suppliers.find((item) => item.ID_supplier === Number(body.supplierId));
        if (!supplier) fail('Supplier tidak ditemukan.', 404);
        if (!Array.isArray(body.items) || !body.items.length) fail('Tambahkan minimal satu barang.');
        let total = 0;
        body.items.forEach((line) => {
          const product = data.products.find((item) => item.ID_produk === Number(line.produkId));
          if (!product) fail(`Produk ${line.produkId} tidak ditemukan.`, 404);
          if (!Number.isInteger(Number(line.jumlah)) || Number(line.jumlah) < 1 || Number(line.harga_satuan) < 0) fail('Jumlah atau harga beli tidak valid.');
          product.stok += Number(line.jumlah); total += Number(line.jumlah) * Number(line.harga_satuan);
        });
        const order = { ID_pengadaan: nextId(data, 'purchase'), tanggal_pesan: today(), supplierId: supplier.ID_supplier, total_harga: total, Supplier: supplier };
        data.purchases.unshift(order); write(DB_KEY, data); return clone(order);
      }
    }

    if (parts[0] === 'transaksi') {
      if (method === 'GET' && parts.length === 1) return clone(data.transactions.map((item) => attachTransaction(data, item)));
      if (method === 'POST') {
        if (!Array.isArray(body.items) || !body.items.length) fail('Keranjang transaksi masih kosong.');
        let total = 0; const lines = [];
        body.items.forEach((line) => {
          const product = data.products.find((item) => item.ID_produk === Number(line.produkId));
          const qty = Number(line.jumlah);
          if (!product) fail(`Produk ${line.produkId} tidak ditemukan.`, 404);
          if (!Number.isInteger(qty) || qty < 1 || product.stok < qty) fail(`Stok ${product.nama_produk} tidak mencukupi.`);
          product.stok -= qty; const subtotal = product.harga * qty; total += subtotal;
          lines.push({ produkId: product.ID_produk, jumlah: qty, subtotal, Produk: clone(product) });
        });
        const transaction = { ID_transaksi: nextId(data, 'transaction'), tanggal: new Date().toISOString(), pelangganId: body.pelangganId ? Number(body.pelangganId) : null, karyawanId: user?.ID_user || 2, total_harga: total, status: 'pending', detail: lines };
        data.transactions.unshift(transaction); write(DB_KEY, data); return clone(transaction);
      }
      if (method === 'GET' && parts[1] && parts[2] === 'status') {
        const transaction = data.transactions.find((item) => item.ID_transaksi === Number(parts[1]));
        if (!transaction) fail('Transaksi tidak ditemukan.', 404);
        return clone(attachTransaction(data, transaction));
      }
    }

    if (parts[0] === 'pembayaran' && method === 'POST') {
      const transaction = data.transactions.find((item) => item.ID_transaksi === Number(body.transaksiId));
      if (!transaction) fail('Transaksi tidak ditemukan.', 404);
      if (transaction.status !== 'pending') fail('Transaksi sudah diproses.');
      const amount = Number(body.jumlah_bayar);
      if (!Number.isFinite(amount) || amount < transaction.total_harga) fail('Jumlah pembayaran kurang dari total belanja.');
      const payment = { ID_pembayaran: nextId(data, 'payment'), transaksiId: transaction.ID_transaksi, metode_pembayaran: body.metode_pembayaran, tanggal_bayar: new Date().toISOString(), jumlah_bayar: amount };
      transaction.status = 'lunas'; transaction.Pembayaran = payment; write(DB_KEY, data);
      return { pembayaran: clone(payment), kembalian: amount - transaction.total_harga };
    }

    if (parts[0] === 'nota' && method === 'POST') {
      const transaction = data.transactions.find((item) => item.ID_transaksi === Number(parts[1]));
      if (!transaction) fail('Transaksi tidak ditemukan.', 404);
      if (transaction.status !== 'lunas') fail('Transaksi belum lunas.');
      if (!transaction.Nota) transaction.Nota = { ID_nota: nextId(data, 'note'), transaksiId: transaction.ID_transaksi, tanggal_cetak: new Date().toISOString() };
      write(DB_KEY, data); return { nota: clone(transaction.Nota), transaksi: clone(attachTransaction(data, transaction)) };
    }

    if (parts[0] === 'garansi') {
      if (method === 'POST') {
        const transaction = data.transactions.find((item) => item.ID_transaksi === Number(body.transaksiId));
        if (!transaction) fail('Transaksi tidak ditemukan.', 404);
        if (transaction.pelangganId !== user?.ID_user) fail('Transaksi ini bukan milik akun pelanggan demo.', 403);
        if (transaction.status !== 'lunas') fail('Transaksi belum lunas.');
        if (data.warranties.some((item) => item.transaksiId === transaction.ID_transaksi)) fail('Garansi untuk transaksi ini sudah pernah diajukan.');
        const start = new Date(); const end = new Date(start); end.setDate(end.getDate() + 365);
        const warranty = { ID_garansi: nextId(data, 'warranty'), transaksiId: transaction.ID_transaksi, pelangganId: user.ID_user, tanggal_mulai: start.toISOString().slice(0, 10), tanggal_akhir: end.toISOString().slice(0, 10), status: 'aktif' };
        data.warranties.unshift(warranty); write(DB_KEY, data); return clone(warranty);
      }
      if (method === 'PATCH' && parts[1] && parts[2] === 'klaim') {
        const warranty = data.warranties.find((item) => item.ID_garansi === Number(parts[1]));
        if (!warranty) fail('Garansi tidak ditemukan.', 404);
        if (warranty.status !== 'aktif') fail('Garansi tidak dalam status aktif.');
        if (new Date(warranty.tanggal_akhir) < new Date(today())) { warranty.status = 'kadaluarsa'; write(DB_KEY, data); fail('Garansi sudah kadaluarsa.'); }
        warranty.status = 'diklaim'; write(DB_KEY, data); return clone(warranty);
      }
    }

    if (parts[0] === 'laporan') {
      if (method === 'GET' && parts.length === 1) return clone(data.reports.filter((item) => item.ownerId === (user?.ID_user || 1)));
      if (method === 'POST') {
        if (!/^\d{4}-\d{2}$/.test(body.periode || '')) fail('Format periode harus YYYY-MM.');
        const report = { ID_laporan: nextId(data, 'report'), ownerId: user?.ID_user || 1, jenis_laporan: body.jenis_laporan, periode: body.periode };
        data.reports.unshift(report); write(DB_KEY, data); return clone(report);
      }
    }

    fail(`Endpoint demo belum disimulasikan: ${method} /${cleanPath}`, 404);
  }

  function exportCsv(id) {
    const data = db(); const report = data.reports.find((item) => item.ID_laporan === Number(id));
    if (!report) fail('Laporan tidak ditemukan.', 404);
    let rows;
    if (report.jenis_laporan === 'penjualan') {
      rows = ['ID,Tanggal,Total,Status'];
      data.transactions.filter((item) => item.status === 'lunas' && String(item.tanggal).slice(0, 7) === report.periode)
        .forEach((item) => rows.push(`${item.ID_transaksi},${item.tanggal},${item.total_harga},${item.status}`));
    } else {
      rows = ['ID,Nama,Kategori,Harga,Stok'];
      data.products.forEach((item) => rows.push(`${item.ID_produk},"${String(item.nama_produk).replace(/"/g, '""')}","${item.kategori || ''}",${item.harga},${item.stok}`));
    }
    return { filename: `laporan-${report.jenis_laporan}-${report.periode}.csv`, csv: rows.join('\n') };
  }

  function reset() {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    return true;
  }

  window.PJDemoStore = { auth, request, exportCsv, reset, getDatabase: db };
})();
