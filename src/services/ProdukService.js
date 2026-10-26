const { Produk } = require('../models');
const HttpError = require('../utils/HttpError');

const cari = async (id) => {
  const p = await Produk.findByPk(id);
  if (!p) throw new HttpError('Produk tidak ditemukan', 404);
  return p;
};

exports.semua = () => Produk.findAll();
exports.detail = cari;
exports.tambah = (data) => Produk.create(data);
exports.ubah = async (id, data) => (await cari(id)).update(data);
exports.hapus = async (id) => (await cari(id)).destroy();
exports.ubahStok = async (id, stok) => {
  if (stok < 0) throw new HttpError('Stok tidak boleh negatif');
  return (await cari(id)).update({ stok });
};