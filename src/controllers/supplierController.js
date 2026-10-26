const S = require('../services/SupplierService');

exports.semua = async (req, res) => res.json(await S.semua());
exports.tambah = async (req, res) => res.status(201).json(await S.tambah(req.body));
exports.lihatPesanan = async (req, res) => res.json(await S.lihatPesanan(req.params.id));