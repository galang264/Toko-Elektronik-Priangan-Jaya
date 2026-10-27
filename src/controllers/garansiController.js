const S = require('../services/GaransiService');

exports.ajukan = async (req, res) =>
  res.status(201).json(await S.ajukan({ pelangganId: req.user.id, transaksiId: req.body.transaksiId }));
exports.klaim = async (req, res) => res.json(await S.klaim(req.params.id));