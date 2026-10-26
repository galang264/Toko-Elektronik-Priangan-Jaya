const r = require('express').Router();
const c = require('../controllers/supplierController');
const auth = require('../middlewares/auth');
const allow = require('../middlewares/role');

r.use(auth, allow('owner'));
r.get('/', c.semua);
r.post('/', c.tambah);
r.get('/:id/pesanan', c.lihatPesanan);

module.exports = r;