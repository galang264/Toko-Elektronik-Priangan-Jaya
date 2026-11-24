const {
    sequelize,
    Transaksi,
    DetailTransaksi,
    Produk,
    Pembayaran,
    Nota,
    User
} = require('../models');

const HttpError = require('../utils/HttpError');

// Membuat transaksi
// items: [{ produkId, jumlah }]
exports.buat = async ({ karyawanId, pelangganId, items }) => {

    if (!karyawanId && !pelangganId) {
        throw new HttpError('Identitas pembuat transaksi tidak valid', 403);
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new HttpError('Keranjang belanja masih kosong');
    }

    // Gabungkan produk yang sama apabila dikirim lebih dari sekali.
    const groupedItems = new Map();

    for (const item of items) {
        const produkId = Number(item.produkId);
        const jumlah = Number(item.jumlah);

        if (!Number.isInteger(produkId) || produkId <= 0) {
            throw new HttpError('ID produk tidak valid');
        }

        if (!Number.isInteger(jumlah) || jumlah <= 0) {
            throw new HttpError('Jumlah produk harus lebih dari 0');
        }

        groupedItems.set(
            produkId,
            (groupedItems.get(produkId) || 0) + jumlah
        );
    }

    return sequelize.transaction(async (t) => {

        // Validasi pelanggan jika transaksi dibuat untuk pelanggan tertentu.
        if (pelangganId) {
            const pelanggan = await User.findByPk(pelangganId, {
                transaction: t
            });

            if (!pelanggan || pelanggan.role !== 'pelanggan') {
                throw new HttpError('Pelanggan tidak ditemukan', 404);
            }
        }

        const dataTransaksi = {
            status: 'pending',
            pelangganId: pelangganId || null,
            karyawanId: karyawanId || null
        };

        const trx = await Transaksi.create(dataTransaksi, {
            transaction: t
        });

        let total = 0;

        for (const [produkId, jumlah] of groupedItems) {

            const produk = await Produk.findByPk(produkId, {
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!produk) {
                throw new HttpError(
                    `Produk ${produkId} tidak ditemukan`,
                    404
                );
            }

            if (Number(produk.stok) < jumlah) {
                throw new HttpError(
                    `Stok ${produk.nama_produk} tidak mencukupi`
                );
            }

            const subtotal = Number(produk.harga) * jumlah;

            await DetailTransaksi.create({
                transaksiId: trx.ID_transaksi,
                produkId: produk.ID_produk,
                jumlah,
                subtotal
            }, {
                transaction: t
            });

            // Kurangi stok secara otomatis.
            await produk.update({
                stok: Number(produk.stok) - jumlah
            }, {
                transaction: t
            });

            total += subtotal;
        }

        await trx.update({
            total_harga: total
        }, {
            transaction: t
        });

        return trx;
    });
};


// Menghitung total transaksi
exports.hitungTotal = async (transaksiId, transaction) => {

    const total = await DetailTransaksi.sum('subtotal', {
        where: { transaksiId },
        transaction
    });

    return total || 0;
};


// Melihat detail transaksi
exports.lihatStatus = async (id, user) => {

    const trx = await Transaksi.findByPk(id, {
        include: [
            {
                model: DetailTransaksi,
                as: 'detail',
                include: [Produk]
            },
            Pembayaran,
            Nota
        ]
    });

    if (!trx) {
        throw new HttpError('Transaksi tidak ditemukan', 404);
    }

    // Pelanggan hanya dapat melihat transaksi miliknya.
    if (
        user.role === 'pelanggan' &&
        Number(trx.pelangganId) !== Number(user.id)
    ) {
        throw new HttpError('Bukan transaksi Anda', 403);
    }

    return trx;
};


// Daftar transaksi
exports.daftar = (user) => {

    return Transaksi.findAll({
        where: user.role === 'pelanggan'
            ? { pelangganId: user.id }
            : {},

        include: [
            {
                model: User,
                as: 'pelanggan',
                attributes: ['ID_user', 'nama']
            },
            {
                model: DetailTransaksi,
                as: 'detail',
                include: [Produk]
            },
            Pembayaran
        ],

        order: [['ID_transaksi', 'DESC']]
    });
};