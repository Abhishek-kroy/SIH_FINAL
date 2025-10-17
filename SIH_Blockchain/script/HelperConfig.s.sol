// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library HelperConfig {
    function getRpcUrl(uint256 chainId) public pure returns (string memory) {
        if (chainId == 31337) {
            // Local Anvil
            return "http://127.0.0.1:8545";
        } else if (chainId == 11155111) {
            // Sepolia
            return "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID";
        } else if (chainId == 1) {
            // Ethereum Mainnet
            return "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID";
        } else {
            revert("Unsupported chainId");
        }
    }
}
