const S = require('../services/TransaksiService');

exports.buat = async (req, res) => {
  const { pelangganId, items } = req.body;
  res.status(201).json(await S.buat({ karyawanId: req.user.id, pelangganId, items }));
};
exports.lihatStatus = async (req, res) => res.json(await S.lihatStatus(req.params.id, req.user));