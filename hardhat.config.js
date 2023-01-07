require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */

const {
    GOERLI_RPC_URL,
    PRIVATE_KEY,
    ETHERSCAN_API_KEY,
    COINMARKETCAP_API_KEY,
} = process.env;

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    solidity: "0.8.17",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "PLN",
        coinmarketcap: COINMARKETCAP_API_KEY,
        //token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
};
