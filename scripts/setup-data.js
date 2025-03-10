const { db } = require('../server/db');
const { users, collections, nfts } = require('../shared/schema');

// Create debug data for testing
async function setupDebugData() {
  console.log('🔍 Checking if debug user exists...');
  
  // Check if user already exists
  const existingUsers = await db.select().from(users);
  
  if (existingUsers.length > 0) {
    console.log('ℹ️ Debug user already exists, skipping creation');
    return;
  }
  
  console.log('✨ Creating debug user...');
  
  // Insert a debug user
  const [debugUser] = await db.insert(users).values({
    username: 'DebugUser',
    email: 'DebugUser@example.com',
    walletAddress: '0xd41a7Be0D607e4cB8940DDf7E9Dc0657B91B4511',
    profileImage: 'https://placehold.co/400x400/9775f9/ffffff?text=DU',
    favorites: [],
    stats: {
      totalViews: 0,
      totalLikes: 0,
      totalSales: 0,
      totalRevenue: "0",
      totalNFTs: 0,
      createdNFTs: 0,
      ownedNFTs: 0,
      collections: 0
    },
    socialLinks: {
      twitter: 'https://twitter.com/debuguser',
      instagram: 'https://instagram.com/debuguser',
      website: 'https://debuguser.com'
    }
  }).returning();
  
  console.log(`👤 Created user: ${debugUser.username}`);
  
  // Create a sample NFT
  console.log('🖼️ Creating sample NFT...');
  
  const [sampleNFT] = await db.insert(nfts).values({
    tokenId: '0x290dcef1cc9f9',
    name: 'Sample NFT',
    description: 'This is a sample NFT for testing',
    imageUrl: 'https://placehold.co/800x800/9775f9/ffffff?text=NFT',
    creatorId: debugUser.id,
    ownerId: debugUser.id,
    price: '100',
    currency: 'VET',
    isForSale: true,
    isBiddable: true,
    royaltyPercentage: '10',
    collaborators: {},
    tags: ['art', 'digital', 'test'],
    metadata: {
      auctionEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      properties: {
        size: '2000x2000',
        format: 'PNG',
        createdWith: 'Digital Paintbrush'
      }
    }
  }).returning();
  
  console.log(`🖼️ Created NFT: ${sampleNFT.name}`);
  
  // Update user stats
  await db.update(users)
    .set({
      stats: {
        totalViews: 0,
        totalLikes: 0,
        totalSales: 0,
        totalRevenue: "0",
        totalNFTs: 1,
        createdNFTs: 1,
        ownedNFTs: 1,
        collections: 0
      }
    })
    .where(({ eq }) => eq(users.id, debugUser.id));
  
  console.log('✅ Debug data setup complete!');
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