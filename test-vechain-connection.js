import { Framework } from '@vechain/connex-framework';
import { Driver, SimpleNet } from '@vechain/connex-driver';

// Genesis IDs for reference
const TESTNET_GENESIS_ID = '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127';
const MAINNET_GENESIS_ID = '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a';

async function testConnection() {
  try {
    console.log('Testing connection to VeChain TestNet...');
    
    // Connect to TestNet
    const testnetNet = new SimpleNet('https://testnet.veblocks.net');
    const testnetDriver = await Driver.connect(testnetNet, {
      genesis: TESTNET_GENESIS_ID
    });
    const testnetConnex = new Framework(testnetDriver);
    
    // Get latest block info
    const testnetBlock = await testnetConnex.thor.block().get();
    console.log('TestNet connection successful:');
    console.log('- Number:', testnetBlock.number);
    console.log('- ID:', testnetBlock.id);
    console.log('- ParentID:', testnetBlock.parentID);
    console.log('- GenesisID:', TESTNET_GENESIS_ID);

    // Disconnect driver when done
    testnetDriver.close();
    
    console.log('\nTesting connection to VeChain MainNet...');
    
    // Connect to MainNet 
    const mainnetNet = new SimpleNet('https://mainnet.veblocks.net');
    const mainnetDriver = await Driver.connect(mainnetNet, {
      genesis: MAINNET_GENESIS_ID
    });
    const mainnetConnex = new Framework(mainnetDriver);
    
    // Get latest block info
    const mainnetBlock = await mainnetConnex.thor.block().get();
    console.log('MainNet connection successful:');
    console.log('- Number:', mainnetBlock.number);
    console.log('- ID:', mainnetBlock.id);
    console.log('- ParentID:', mainnetBlock.parentID);
    console.log('- GenesisID:', MAINNET_GENESIS_ID);

    // Disconnect driver when done
    mainnetDriver.close();
    
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error(error);
  }
}

testConnection();