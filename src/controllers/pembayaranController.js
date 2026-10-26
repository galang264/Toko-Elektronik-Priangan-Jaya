const S = require('../services/PembayaranService');

exports.proses = async (req, res) => res.status(201).json(await S.proses(req.body));