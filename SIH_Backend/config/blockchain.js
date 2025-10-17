require('dotenv').config();

const chainId = process.env.CHAIN_ID || "31337";

module.exports = {
  chainId: parseInt(chainId, 10),
  anvilRpcUrl: process.env.ANVIL_RPC_URL || "http://localhost:8545",
  contracts: {
    AccessControl: {
      address: process.env.ACCESS_CONTROL_ADDRESS || "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
      abi: require("../abis/AccessControl.json"),
    },
    BeneficiaryData: {
      address: process.env.BENEFICIARY_DATA_ADDRESS || "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
      abi: require("../abis/BeneficiaryData.json"),
    },
    TransactionHistory: {
      address: process.env.TRANSACTION_HISTORY_ADDRESS || "0x9A676e781A523b5d0C0e43731313A708CB607508",
      abi: require("../abis/TransactionHistory.json"),
    },
    CreditScoring: {
      address: process.env.CREDIT_SCORING_ADDRESS || "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
      abi: require("../abis/CreditScoring.json"),
    },
  },
};
