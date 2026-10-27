const S = require('../services/NotaService');

exports.cetak = async (req, res) => res.json(await S.cetak(req.params.transaksiId));