// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {CreditScoring} from "../src/CreditScoring.sol";
import {AccessControl} from "../src/AccessControl.sol";
import {BeneficiaryData} from "../src/BeneficiaryData.sol";
import {TransactionHistory} from "../src/TransactionHistory.sol";
import {console} from "forge-std/console.sol";

contract DeployCreditScoring is Script {
    CreditScoring public creditScoring;
    AccessControl public accessControl;
    BeneficiaryData public beneficiaryData;
    TransactionHistory public transactionHistory;

    function run() external {
        // Load chainId and private key from .env
        uint256 currentChainId = vm.envUint("CHAIN_ID");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Get RPC URL automatically
        string memory rpcUrl = HelperConfig.getRpcUrl(currentChainId);
        console.log("Deploying to RPC:", rpcUrl, "with chainId:", currentChainId);

        // Start broadcasting transactions with private key
        vm.startBroadcast(deployerPrivateKey);

        (creditScoring, accessControl, beneficiaryData, transactionHistory) = deployContracts(vm.addr(deployerPrivateKey));

        vm.stopBroadcast();

        console.log("AccessControl contract deployed at:", address(accessControl));
        console.log("BeneficiaryData contract deployed at:", address(beneficiaryData));
        console.log("TransactionHistory contract deployed at:", address(transactionHistory));
        console.log("CreditScoring contract deployed at:", address(creditScoring));
    }

    function deployContracts(address _deployer) public returns (CreditScoring, AccessControl, BeneficiaryData, TransactionHistory) {
        // Deploy subcontracts
        accessControl = new AccessControl();
        beneficiaryData = new BeneficiaryData(address(accessControl));
        transactionHistory = new TransactionHistory();

        // Deploy main CreditScoring contract
        creditScoring = new CreditScoring(
            address(accessControl),
            address(beneficiaryData),
            address(transactionHistory)
        );
        accessControl.assignRole(_deployer, AccessControl.Role.Admin);
        // Assign Admin role to CreditScoring contract for internal operations
        accessControl.assignRole(address(creditScoring), AccessControl.Role.Admin);
        return (creditScoring, accessControl, beneficiaryData, transactionHistory);
    }
}
