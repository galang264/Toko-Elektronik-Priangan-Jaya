const r = require('express').Router();
const c = require('../controllers/pengadaanController');
const auth = require('../middlewares/auth');
const allow = require('../middlewares/role');

r.use(auth, allow('owner'));
r.post('/', c.buat);
r.get('/', c.semua);

module.exports = r;