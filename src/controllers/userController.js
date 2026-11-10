const S = require('../services/UserService');

exports.buat = async (req, res) => res.status(201).json(await S.buat(req.user, req.body));
exports.daftar = async (req, res) => res.json(await S.daftar(req.user, req.query.role));