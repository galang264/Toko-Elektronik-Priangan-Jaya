const { sequelize, Transaksi, Pembayaran } = require('../models');
const HttpError = require('../utils/HttpError');

exports.proses = async ({ transaksiId, metode_pembayaran, jumlah_bayar }) => {
  if (!transaksiId) throw new HttpError('transaksiId wajib diisi');
  if (!metode_pembayaran) throw new HttpError('metode_pembayaran wajib diisi');
  if (typeof jumlah_bayar !== 'number') throw new HttpError('jumlah_bayar harus angka');

  return sequelize.transaction(async (t) => {
    const trx = await Transaksi.findByPk(transaksiId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!trx) throw new HttpError('Transaksi tidak ditemukan', 404);
    if (trx.status !== 'pending') throw new HttpError('Transaksi sudah diproses');
    if (jumlah_bayar < trx.total_harga) throw new HttpError('Jumlah bayar kurang');

    const bayar = await Pembayaran.create(
      { transaksiId, metode_pembayaran, jumlah_bayar }, { transaction: t });
    await trx.update({ status: 'lunas' }, { transaction: t });

    return { pembayaran: bayar, kembalian: jumlah_bayar - trx.total_harga };
  });
};