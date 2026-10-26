const S = require('../services/LaporanService');

exports.tambah = async (req, res) => res.status(201).json(await S.tambah(req.user.id, req.body));
exports.semua = async (req, res) => res.json(await S.semua(req.user.id));
exports.exportLaporan = async (req, res) => {
  const { filename, csv } = await S.exportCsv(req.params.id);
  res.header('Content-Type', 'text/csv');
  res.attachment(filename);
  res.send(csv);
};