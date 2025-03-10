require("@nomicfoundation/hardhat-toolbox");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "vechain",
  networks: {
    vechain: {
      url: "https://testnet.veblocks.net", // VeChain testnet
      accounts: [process.env.VITE_VECHAIN_PRIVATE_KEY || ""]
    },
    mainnet: {
      url: "https://mainnet.veblocks.net", // VeChain mainnet
      accounts: [process.env.VITE_VECHAIN_PRIVATE_KEY || ""]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};