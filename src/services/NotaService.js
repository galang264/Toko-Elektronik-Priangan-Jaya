const { Transaksi, DetailTransaksi, Produk, Pembayaran, Nota, User } = require('../models');
const HttpError = require('../utils/HttpError');

exports.cetak = async (transaksiId) => {
  const trx = await Transaksi.findByPk(transaksiId);
  if (!trx) throw new HttpError('Transaksi tidak ditemukan', 404);
  if (trx.status !== 'lunas') throw new HttpError('Transaksi belum lunas');

  const [nota] = await Nota.findOrCreate({ where: { transaksiId } });

  const lengkap = await Transaksi.findByPk(transaksiId, {
    include: [
      { model: DetailTransaksi, as: 'detail', include: [Produk] },
      Pembayaran,
      { model: User, as: 'pelanggan', attributes: ['nama'] },
      { model: User, as: 'karyawan', attributes: ['nama'] },
    ],
  });
  return { nota, transaksi: lengkap };
};