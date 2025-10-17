// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {DeployCreditScoring} from "../script/Deploy.s.sol";
import {CreditScoring} from "../src/CreditScoring.sol";
import {AccessControl} from "../src/AccessControl.sol";
import {BeneficiaryData} from "../src/BeneficiaryData.sol";
import {TransactionHistory} from "../src/TransactionHistory.sol";

contract DeployTest is Test {
    DeployCreditScoring public deployer;
    CreditScoring public creditScoring;
    AccessControl public accessControl;
    BeneficiaryData public beneficiaryData;
    TransactionHistory public transactionHistory;

    function setUp() public {
        deployer = new DeployCreditScoring();
        (creditScoring, accessControl, beneficiaryData, transactionHistory) = deployer.deployContracts(address(this));

    // Make test contract an Admin
    accessControl.assignRole(address(this), AccessControl.Role.Admin);
    }

    function testDeployContracts() public {
        (creditScoring, accessControl, beneficiaryData, transactionHistory) = deployer.deployContracts(address(this));

        // Check that contracts are deployed (non-zero addresses)
        assertTrue(address(creditScoring) != address(0), "CreditScoring not deployed");
        assertTrue(address(accessControl) != address(0), "AccessControl not deployed");
        assertTrue(address(beneficiaryData) != address(0), "BeneficiaryData not deployed");
        assertTrue(address(transactionHistory) != address(0), "TransactionHistory not deployed");
    }

    function testRoleAssignmentInDeployment() public {
        (creditScoring, accessControl, beneficiaryData, transactionHistory) = deployer.deployContracts(address(this));

        // Check that deployer (msg.sender in deployContracts) has Admin role
        assertEq(uint(accessControl.getRole(address(this))), uint(AccessControl.Role.Admin), "Deployer should have Admin role");
    }

    function testContractAddressesSetCorrectly() public {
        (creditScoring, accessControl, beneficiaryData, transactionHistory) = deployer.deployContracts(address(this));

        // Check that contracts are deployed (non-zero addresses)
        assertTrue(address(creditScoring) != address(0), "CreditScoring not deployed");
        assertTrue(address(accessControl) != address(0), "AccessControl not deployed");
        assertTrue(address(beneficiaryData) != address(0), "BeneficiaryData not deployed");
        assertTrue(address(transactionHistory) != address(0), "TransactionHistory not deployed");
    }

    function testMultipleDeployments() public {
        // Deploy first set
        (CreditScoring cs1, AccessControl ac1, BeneficiaryData bd1, TransactionHistory th1) = deployer.deployContracts(address(this));

        // Deploy second set
        (CreditScoring cs2, AccessControl ac2, BeneficiaryData bd2, TransactionHistory th2) = deployer.deployContracts(address(this));

        // Ensure different addresses
        assertTrue(address(cs1) != address(cs2), "Contracts should have different addresses");
        assertTrue(address(ac1) != address(ac2), "AccessControl should have different addresses");
        assertTrue(address(bd1) != address(bd2), "BeneficiaryData should have different addresses");
        assertTrue(address(th1) != address(th2), "TransactionHistory should have different addresses");
    }
}
