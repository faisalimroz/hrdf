import User from '../models/User.js';

export const seedAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const defaultAdminEmail = 'admin@hdfd-foundation.org';
      const existingUser = await User.findOne({ email: defaultAdminEmail });

      if (existingUser) {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`[AdminSeed] Upgraded existing user ${defaultAdminEmail} to admin.`);
      } else {
        await User.create({
          name: 'Hdfd Super Admin',
          email: defaultAdminEmail,
          password: 'Admin@123456',
          role: 'admin',
          status: 'active',
          preferredCurrency: 'BDT',
        });
        console.log(`[AdminSeed] Default admin account seeded: ${defaultAdminEmail} / Admin@123456`);
      }
    }
  } catch (error) {
    console.error('[AdminSeed Error]:', error.message);
  }
};

export default seedAdminUser;
