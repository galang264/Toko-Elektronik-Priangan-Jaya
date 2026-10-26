const S = require('../services/PengadaanService');

exports.buat = async (req, res) => res.status(201).json(await S.buat(req.body));
exports.semua = async (req, res) => res.json(await S.semua());