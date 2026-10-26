const { sequelize, Pengadaan, DetailPengadaan, Produk, Supplier } = require('../models');
const HttpError = require('../utils/HttpError');

// items: [{ produkId, jumlah, harga_satuan }]
exports.buat = async ({ supplierId, items }) => {
  if (!Array.isArray(items) || items.length === 0) throw new HttpError('Item pengadaan kosong');
  if (!(await Supplier.findByPk(supplierId))) throw new HttpError('Supplier tidak ditemukan', 404);

  return sequelize.transaction(async (t) => {
    const p = await Pengadaan.create({ supplierId }, { transaction: t });
    let total = 0;

    for (const it of items) {
      const produk = await Produk.findByPk(it.produkId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!produk) throw new HttpError(`Produk ${it.produkId} tidak ditemukan`, 404);

      await DetailPengadaan.create({
        pengadaanId: p.ID_pengadaan, produkId: it.produkId,
        jumlah: it.jumlah, harga_satuan: it.harga_satuan,
      }, { transaction: t });

      await produk.update({ stok: produk.stok + it.jumlah }, { transaction: t });
      total += it.jumlah * it.harga_satuan;
    }

    await p.update({ total_harga: total }, { transaction: t });
    return p;
  });
};

exports.semua = () => Pengadaan.findAll({ include: [Produk, Supplier] });