
require('dotenv').config();

const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        console.log('Menghubungkan ke Supabase PostgreSQL...');

        await sequelize.authenticate();

        console.log('Database berhasil terhubung');

        // Tabel yang sudah dibuat melalui Supabase SQL Editor
        // tidak perlu disinkronisasi ulang di sini.

        app.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Gagal start:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
})();
