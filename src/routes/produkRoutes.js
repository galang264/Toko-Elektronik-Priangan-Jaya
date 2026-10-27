const r = require('express').Router();
const c = require('../controllers/produkController');
const auth = require('../middlewares/auth');
const allow = require('../middlewares/role');

r.use(auth);
r.get('/', c.semua);
r.get('/:id', c.detail);
r.post('/', allow('owner', 'karyawan'), c.tambah);
r.put('/:id', allow('owner', 'karyawan'), c.ubah);
r.delete('/:id', allow('owner', 'karyawan'), c.hapus);
r.patch('/:id/stok', allow('karyawan'), c.ubahStok);

module.exports = r;