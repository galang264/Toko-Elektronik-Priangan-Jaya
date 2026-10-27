const { Op } = require('sequelize');
const { Laporan, Transaksi, Produk } = require('../models');
const HttpError = require('../utils/HttpError');

exports.tambah = async (ownerId, { jenis_laporan, periode }) => {
  if (!/^\d{4}-\d{2}$/.test(periode || '')) throw new HttpError('Format periode: YYYY-MM');
  return Laporan.create({ ownerId, jenis_laporan, periode });
};

exports.semua = (ownerId) => Laporan.findAll({ where: { ownerId } });

exports.exportCsv = async (id) => {
  const lap = await Laporan.findByPk(id);
  if (!lap) throw new HttpError('Laporan tidak ditemukan', 404);

  let rows = ['ID,Tanggal,Total,Status'];

  if (lap.jenis_laporan === 'penjualan') {
    const awal = new Date(`${lap.periode}-01`);
    const akhir = new Date(awal); akhir.setMonth(akhir.getMonth() + 1);
    const data = await Transaksi.findAll({
      where: { status: 'lunas', tanggal: { [Op.gte]: awal, [Op.lt]: akhir } },
    });
    data.forEach((t) => rows.push(`${t.ID_transaksi},${t.tanggal.toISOString()},${t.total_harga},${t.status}`));
  } else {
    rows = ['ID,Nama,Kategori,Harga,Stok'];
    const data = await Produk.findAll();
    data.forEach((p) => rows.push(`${p.ID_produk},"${p.nama_produk}",${p.kategori},${p.harga},${p.stok}`));
  }

  return { filename: `laporan-${lap.jenis_laporan}-${lap.periode}.csv`, csv: rows.join('\n') };
};