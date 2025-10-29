require('dotenv').config({ path: '.env.local' }); // ✅ Loads environment variables
require('esbuild-register'); // ✅ Enables TypeScript imports

const { seedDatabase } = require('../src/lib/db/seed.ts');

seedDatabase()
  .then(() => {
    console.log('✅ Database seeded successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
