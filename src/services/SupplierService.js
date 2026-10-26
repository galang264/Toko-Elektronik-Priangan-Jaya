const { Supplier, Pengadaan, Produk } = require('../models');
const HttpError = require('../utils/HttpError');

exports.semua = () => Supplier.findAll();
exports.tambah = (data) => Supplier.create(data);

exports.lihatPesanan = async (supplierId) => {
  const s = await Supplier.findByPk(supplierId);
  if (!s) throw new HttpError('Supplier tidak ditemukan', 404);
  return Pengadaan.findAll({ where: { supplierId }, include: [Produk] });
};