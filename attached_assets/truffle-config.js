require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = process.env.MNEMONIC;

module.exports = {
  networks: {
    vechain: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonic
        },
        providerOrUrl: 'https://testnet.veblocks.net'
      }),
      network_id: '*', // Match any network id
      gas: 8000000,
      gasPrice: 20000000000,
    }
  },
  compilers: {
    solc: {
      version: "0.8.21", // Fetch exact version from solc-bin (default: truffle's version)
    }
  }
};
