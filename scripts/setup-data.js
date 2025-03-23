const { db } = require('../server/db');
const { users, collections, nfts } = require('../shared/schema');

// Create debug data for testing
async function setupDebugData() {
  console.log('🔍 Demo user functionality has been disabled for all deployments');
  
  // Check if any users exist (for basic database verification)
  const existingUsers = await db.select().from(users);
  
  if (existingUsers.length > 0) {
    console.log('ℹ️ Database has existing users, no demo data needed');
    return;
  } else {
    console.log('ℹ️ Database ready but empty - no demo data will be created');
  }
  
  console.log('✅ Setup complete (no demo data created)');
}

// Run the setup
setupDebugData()
  .then(() => {
    console.log('🎉 Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  });