const { ethers } = require('ethers');
const config = require('../config/blockchain');

let provider;
let signer;
let contracts = {};

function initBlockchain() {
  provider = new ethers.JsonRpcProvider(config.anvilRpcUrl);
  const privateKey = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not set in environment variables');
  }
  signer = new ethers.Wallet(privateKey, provider);

  // Initialize contract instances
  contracts.AccessControl = new ethers.Contract(config.contracts.AccessControl.address, config.contracts.AccessControl.abi, signer);
  contracts.BeneficiaryData = new ethers.Contract(config.contracts.BeneficiaryData.address, config.contracts.BeneficiaryData.abi, signer);
  contracts.TransactionHistory = new ethers.Contract(config.contracts.TransactionHistory.address, config.contracts.TransactionHistory.abi, signer);
  contracts.CreditScoring = new ethers.Contract(config.contracts.CreditScoring.address, config.contracts.CreditScoring.abi, signer);
  console.log("CreditScoring address:",config.contracts.CreditScoring.address);

  console.log('Blockchain initialized successfully');
}

function getProvider() {
  return provider;
}

function getSigner() {
  return signer;
}

function getContract(name) {
  return contracts[name];
}

module.exports = {
  initBlockchain,
  getProvider,
  getSigner,
  getContract,
};
