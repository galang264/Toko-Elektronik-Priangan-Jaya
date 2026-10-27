const { Garansi, Transaksi } = require('../models');
const HttpError = require('../utils/HttpError');

const LAMA_GARANSI_HARI = 365;

exports.ajukan = async ({ pelangganId, transaksiId }) => {
  const trx = await Transaksi.findByPk(transaksiId);
  if (!trx) throw new HttpError('Transaksi tidak ditemukan', 404);
  if (trx.pelangganId !== pelangganId) throw new HttpError('Bukan transaksi Anda', 403);
  if (trx.status !== 'lunas') throw new HttpError('Transaksi belum lunas');
  if (await Garansi.findOne({ where: { transaksiId } })) throw new HttpError('Garansi sudah ada');

  const mulai = new Date();
  const akhir = new Date(mulai.getTime() + LAMA_GARANSI_HARI * 86400000);
  return Garansi.create({
    transaksiId, pelangganId,
    tanggal_mulai: mulai, tanggal_akhir: akhir, status: 'aktif',
  });
};

exports.klaim = async (id) => {
  const g = await Garansi.findByPk(id);
  if (!g) throw new HttpError('Garansi tidak ditemukan', 404);
  if (g.status === 'diklaim') throw new HttpError('Garansi sudah diklaim');
  if (new Date(g.tanggal_akhir) < new Date()) {
    await g.update({ status: 'kadaluarsa' });
    throw new HttpError('Garansi sudah kadaluarsa');
  }
  return g.update({ status: 'diklaim' });
};