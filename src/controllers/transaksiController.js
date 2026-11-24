const S = require('../services/TransaksiService');

exports.buat = async (req, res) => {
    const { pelangganId, items } = req.body || {};

    let data;

    if (req.user.role === 'pelanggan') {
        // ID pelanggan diambil dari token JWT.
        // Tidak boleh menggunakan ID pelanggan kiriman browser.
        data = {
            pelangganId: req.user.id,
            items
        };
    } else {
        data = {
            karyawanId: req.user.id,
            pelangganId: pelangganId ? Number(pelangganId) : null,
            items
        };
    }

    const transaksi = await S.buat(data);

    res.status(201).json(transaksi);
};

exports.lihatStatus = async (req, res) => {
    res.json(await S.lihatStatus(req.params.id, req.user));
};

exports.daftar = async (req, res) => {
    res.json(await S.daftar(req.user));
};