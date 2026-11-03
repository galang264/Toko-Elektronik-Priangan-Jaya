const r = require('express').Router();
const c = require('../controllers/userController');
const auth = require('../middlewares/auth');
const allow = require('../middlewares/role');

r.use(auth);
r.post('/', allow('owner', 'karyawan'), c.buat);
r.get('/', allow('owner', 'karyawan'), c.daftar);

module.exports = r;