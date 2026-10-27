const S = require('../services/ProdukService');

exports.semua = async (req, res) => res.json(await S.semua());
exports.detail = async (req, res) => res.json(await S.detail(req.params.id));
exports.tambah = async (req, res) => res.status(201).json(await S.tambah(req.body));
exports.ubah = async (req, res) => res.json(await S.ubah(req.params.id, req.body));
exports.hapus = async (req, res) => { await S.hapus(req.params.id); res.json({ message: 'Produk dihapus' }); };
exports.ubahStok = async (req, res) => res.json(await S.ubahStok(req.params.id, req.body.stok));