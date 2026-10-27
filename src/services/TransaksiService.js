const { sequelize, Transaksi, DetailTransaksi, Produk, Pembayaran, Nota } = require('../models');
const HttpError = require('../utils/HttpError');

// items: [{ produkId, jumlah }]
exports.buat = async ({ karyawanId, pelangganId, items }) => {
  if (!Array.isArray(items) || items.length === 0) throw new HttpError('Item transaksi kosong');

  return sequelize.transaction(async (t) => {
    const trx = await Transaksi.create({ karyawanId, pelangganId, status: 'pending' }, { transaction: t });

    for (const it of items) {
      const produk = await Produk.findByPk(it.produkId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!produk) throw new HttpError(`Produk ${it.produkId} tidak ditemukan`, 404);
      if (it.jumlah <= 0) throw new HttpError('Jumlah harus > 0');
      if (produk.stok < it.jumlah) throw new HttpError(`Stok ${produk.nama_produk} tidak cukup`);

      await DetailTransaksi.create({
        transaksiId: trx.ID_transaksi,
        produkId: produk.ID_produk,
        jumlah: it.jumlah,
        subtotal: produk.harga * it.jumlah,
      }, { transaction: t });

      await produk.update({ stok: produk.stok - it.jumlah }, { transaction: t });
    }

    const total = await exports.hitungTotal(trx.ID_transaksi, t);
    await trx.update({ total_harga: total }, { transaction: t });
    return trx;
  });
};

exports.hitungTotal = async (transaksiId, transaction) => {
  const total = await DetailTransaksi.sum('subtotal', { where: { transaksiId }, transaction });
  return total || 0;
};

exports.lihatStatus = async (id, user) => {
  const trx = await Transaksi.findByPk(id, {
    include: [
      { model: DetailTransaksi, as: 'detail', include: [Produk] },
      Pembayaran, Nota,
    ],
  });
  if (!trx) throw new HttpError('Transaksi tidak ditemukan', 404);
  if (user.role === 'pelanggan' && trx.pelangganId !== user.id)
    throw new HttpError('Bukan transaksi Anda', 403);
  return trx;
};