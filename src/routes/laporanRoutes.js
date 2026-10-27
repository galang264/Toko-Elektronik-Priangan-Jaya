const r = require('express').Router();
const c = require('../controllers/laporanController');
const auth = require('../middlewares/auth');
const allow = require('../middlewares/role');

r.use(auth, allow('owner'));
r.post('/', c.tambah);
r.get('/', c.semua);
r.get('/:id/export', c.exportLaporan);

module.exports = r;