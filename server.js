require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database terhubung');
    app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
  } catch (e) {
    console.error('Gagal start:', e.message);
  }
})();