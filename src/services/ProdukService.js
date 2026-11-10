const { Produk } = require('../models');
const HttpError = require('../utils/HttpError');

const cari = async (id) => {
  const p = await Produk.findByPk(id);
  if (!p) throw new HttpError('Produk tidak ditemukan', 404);
  return p;
};

const cekProduk = (d, wajib) => {
  if (wajib || d.nama_produk !== undefined) {
    if (typeof d.nama_produk !== 'string' || !d.nama_produk.trim()) throw new HttpError('nama_produk wajib diisi');
  }
  if (wajib || d.harga !== undefined) {
    if (typeof d.harga !== 'number' || d.harga < 0) throw new HttpError('harga harus angka >= 0');
  }
  if (d.stok !== undefined && (!Number.isInteger(d.stok) || d.stok < 0)) {
    throw new HttpError('stok harus bilangan bulat >= 0');
  }
};

exports.semua = () => Produk.findAll({ order: [['ID_produk', 'ASC']] });
exports.detail = cari;
exports.tambah = (data) => { cekProduk(data, true); return Produk.create(data); };
exports.ubah = async (id, data) => { cekProduk(data, false); return (await cari(id)).update(data); };
exports.hapus = async (id) => (await cari(id)).destroy();
exports.ubahStok = async (id, stok) => {
  if (!Number.isInteger(stok)) throw new HttpError('stok harus bilangan bulat');
  if (stok < 0) throw new HttpError('Stok tidak boleh negatif');
  return (await cari(id)).update({ stok });
};