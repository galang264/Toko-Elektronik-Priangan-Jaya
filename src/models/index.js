const sequelize = require('../config/database');
const User = require('./User');
const Supplier = require('./Supplier');
const Pengadaan = require('./Pengadaan');
const { DetailPengadaan } = require('./Pengadaan');
const Produk = require('./Produk');
const Laporan = require('./Laporan');
const Transaksi = require('./Transaksi');
const DetailTransaksi = require('./DetailTransaksi');
const Pembayaran = require('./Pembayaran');
const Nota = require('./Nota');
const Garansi = require('./Garansi');

// Supplier 1 -> 0..* Pengadaan
Supplier.hasMany(Pengadaan, { foreignKey: 'supplierId' });
Pengadaan.belongsTo(Supplier, { foreignKey: 'supplierId' });

// Pengadaan <> Produk (agregasi, lewat pivot)
Pengadaan.belongsToMany(Produk, { through: DetailPengadaan, foreignKey: 'pengadaanId', otherKey: 'produkId' });
Produk.belongsToMany(Pengadaan, { through: DetailPengadaan, foreignKey: 'produkId', otherKey: 'pengadaanId' });

// Owner 1 -> 0..* Laporan
User.hasMany(Laporan, { foreignKey: 'ownerId' });
Laporan.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Transaksi - User (karyawan & pelanggan)
User.hasMany(Transaksi, { foreignKey: 'pelangganId', as: 'transaksiPelanggan' });
User.hasMany(Transaksi, { foreignKey: 'karyawanId', as: 'transaksiKaryawan' });
Transaksi.belongsTo(User, { foreignKey: 'pelangganId', as: 'pelanggan' });
Transaksi.belongsTo(User, { foreignKey: 'karyawanId', as: 'karyawan' });

// Komposisi Transaksi 1 -> 1..* DetailTransaksi
Transaksi.hasMany(DetailTransaksi, { foreignKey: 'transaksiId', as: 'detail', onDelete: 'CASCADE' });
DetailTransaksi.belongsTo(Transaksi, { foreignKey: 'transaksiId' });

// DetailTransaksi * -> 1 Produk
Produk.hasMany(DetailTransaksi, { foreignKey: 'produkId' });
DetailTransaksi.belongsTo(Produk, { foreignKey: 'produkId' });

// Transaksi 1 -> 1 Pembayaran, 1 Nota, 0..1 Garansi
Transaksi.hasOne(Pembayaran, { foreignKey: 'transaksiId' });
Pembayaran.belongsTo(Transaksi, { foreignKey: 'transaksiId' });
Transaksi.hasOne(Nota, { foreignKey: 'transaksiId' });
Nota.belongsTo(Transaksi, { foreignKey: 'transaksiId' });
Transaksi.hasOne(Garansi, { foreignKey: 'transaksiId' });
Garansi.belongsTo(Transaksi, { foreignKey: 'transaksiId' });

// Pelanggan 1 -> 0..* Garansi
User.hasMany(Garansi, { foreignKey: 'pelangganId' });
Garansi.belongsTo(User, { foreignKey: 'pelangganId', as: 'pelanggan' });

module.exports = {
  sequelize, User, Supplier, Pengadaan, DetailPengadaan, Produk, Laporan,
  Transaksi, DetailTransaksi, Pembayaran, Nota, Garansi,
};