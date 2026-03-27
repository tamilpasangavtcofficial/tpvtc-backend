const bcrypt = require('bcryptjs');
const { UserRole, User } = require('../models');

const seedDB = async () => {
    try {
        // Seed Roles
        const roles = ['developer', 'founder', 'event team', 'media team', 'staff'];
        for (const roleName of roles) {
            await UserRole.findOrCreate({ where: { role: roleName } });
        }
        console.log('Roles seeded');

        // Seed Initial Developer
        const devRole = await UserRole.findOne({ where: { role: 'developer' } });
        const hashedPassword = await bcrypt.hash('Bavi@2003', 10);
        
        await User.findOrCreate({
            where: { email: 'skbavi61@gmail.com' },
            defaults: {
                username: 'skbavi',
                password: hashedPassword,
                role_id: devRole.id
            }
        });
        console.log('Initial developer user seeded');
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

module.exports = seedDB;
