require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

(async () => {
  try {
    const { SEED_OWNER_NAMA, SEED_OWNER_EMAIL, SEED_OWNER_USERNAME, SEED_OWNER_PASSWORD } = process.env;
    if (!SEED_OWNER_USERNAME || !SEED_OWNER_PASSWORD || !SEED_OWNER_EMAIL) {
      throw new Error('Isi SEED_OWNER_* di file .env dulu');
    }

    await sequelize.authenticate();
    await sequelize.sync();

    const ada = await User.findOne({ where: { username: SEED_OWNER_USERNAME } });
    if (ada) {
      console.log(`Owner "${SEED_OWNER_USERNAME}" sudah ada, dilewati`);
    } else {
      await User.create({
        nama: SEED_OWNER_NAMA || 'Owner',
        email: SEED_OWNER_EMAIL,
        username: SEED_OWNER_USERNAME,
        password: await bcrypt.hash(SEED_OWNER_PASSWORD, 10),
        role: 'owner',
      });
      console.log(`Owner "${SEED_OWNER_USERNAME}" berhasil dibuat`);
    }
  } catch (e) {
    console.error('Seed gagal:', e.message);
  } finally {
    await sequelize.close();
  }
})();