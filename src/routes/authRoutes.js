const r = require('express').Router();
const c = require('../controllers/authController');

r.post('/register', c.registrasi);
r.post('/login', c.login);
r.post('/lupa-password', c.lupaPassword);
r.post('/reset-password', c.resetPassword);

module.exports = r;