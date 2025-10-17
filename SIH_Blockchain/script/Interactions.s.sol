// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {CreditScoring} from "../src/CreditScoring.sol";
import {AccessControl} from "../src/AccessControl.sol";

contract Interactions is Script {
    function run() external {
        uint256 chainId = vm.envUint("CHAIN_ID");
        string memory rpcUrl = HelperConfig.getRpcUrl(chainId);
        vm.createSelectFork(rpcUrl);

        uint256 userPrivateKey = vm.envUint("PRIVATE_KEY");
        address creditScoringAddress = vm.envAddress("CREDIT_SCORING_ADDRESS");
        CreditScoring creditScoring = CreditScoring(creditScoringAddress);

        vm.startBroadcast(userPrivateKey);

        // Example interactions
        creditScoring.assignRole(address(this), AccessControl.Role.Admin);

        // Add a new beneficiary
        creditScoring.addBeneficiary("John Doe", "BEN001", "IFSC001");

        // Update credit score
        creditScoring.updateCreditScore("BEN001", "IFSC001", 80, "Low Risk");

        // Approve loan
        creditScoring.approveLoan("BEN001", "IFSC001", 5000);

        // Record repayment
        creditScoring.recordRepayment("BEN001", "IFSC001", 2000);

        vm.stopBroadcast();
    }
}