// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {CreditScoring} from "../src/CreditScoring.sol";
import {AccessControl} from "../src/AccessControl.sol";
import {BeneficiaryData} from "../src/BeneficiaryData.sol";
import {TransactionHistory} from "../src/TransactionHistory.sol";
import {DeployCreditScoring} from "../script/Deploy.s.sol";

contract CreditScoringTest is Test {
    CreditScoring public creditScoring;
    AccessControl public accessControl;
    BeneficiaryData public beneficiaryData;
    TransactionHistory public transactionHistory;
    address public admin;
    address public bank;
    address public channelPartner;
    address public auditor;

    function setUp() public {
        // Use Deploy.s.sol to deploy contracts
        DeployCreditScoring deployer = new DeployCreditScoring();
        (creditScoring, accessControl, beneficiaryData, transactionHistory) = deployer.deployContracts(address(this));

        // Assign roles
        accessControl.assignRole(address(this), AccessControl.Role.Admin);
        accessControl.assignRole(address(creditScoring), AccessControl.Role.Admin);

        // Initialize test addresses
        admin = address(this);
     
        bank = address(0x1);
        channelPartner = address(0x2);
        auditor = address(0x3);

        // Assign roles to test addresses
        accessControl.assignRole(bank, AccessControl.Role.Bank);
        accessControl.assignRole(channelPartner, AccessControl.Role.ChannelPartner);
        accessControl.assignRole(auditor, AccessControl.Role.Auditor);
    }

    function test_AddBeneficiary() public {
        creditScoring.addBeneficiary("John Doe", "1234567890", "IFSC001");
        (string memory name, string memory accNum, string memory ifsc, , , , , , , ) = creditScoring.getBeneficiary("1234567890", "IFSC001");
        assertEq(name, "John Doe");
        assertEq(accNum, "1234567890");
        assertEq(ifsc, "IFSC001");
    }

    function test_UpdateCreditScore() public {
        creditScoring.addBeneficiary("John Doe", "1234567890", "IFSC001");
        creditScoring.updateCreditScore("1234567890", "IFSC001", 85, "Low Risk - High Need");
        (, , , uint256 score, string memory band, , , , , ) = creditScoring.getBeneficiary("1234567890", "IFSC001");
        assertEq(score, 85);
        assertEq(band, "Low Risk - High Need");
    }

    function test_ApproveLoan() public {
        creditScoring.addBeneficiary("John Doe", "1234567890", "IFSC001");
        creditScoring.updateCreditScore("1234567890", "IFSC001", 85, "Low Risk - High Need");
        creditScoring.approveLoan("1234567890", "IFSC001", 1000);
        (, , , , , bool approved, uint256 amount, , , ) = creditScoring.getBeneficiary("1234567890", "IFSC001");
        assertTrue(approved);
        assertEq(amount, 1000);
    }

    function test_RecordRepayment() public {
        creditScoring.addBeneficiary("John Doe", "1234567890", "IFSC001");
        creditScoring.updateCreditScore("1234567890", "IFSC001", 85, "Low Risk - High Need");
        creditScoring.approveLoan("1234567890", "IFSC001", 1000);
        creditScoring.recordRepayment("1234567890", "IFSC001", 500);
        (, , , , , , , uint256 repaid, , ) = creditScoring.getBeneficiary("1234567890", "IFSC001");
        assertEq(repaid, 500);
    }

    function test_TransactionHistory() public {
        creditScoring.addBeneficiary("John Doe", "1234567890", "IFSC001");
        uint256 count = creditScoring.getTransactionCount();
        assertEq(count, 1);
        ( , , bytes32 beneficiaryKey, string memory txType, ) = creditScoring.getTransaction(0);
        bytes32 expectedKey = keccak256(abi.encodePacked("1234567890", "IFSC001"));
        assertEq(beneficiaryKey, expectedKey);
        assertEq(txType, "BeneficiaryAdded");
    }

    function test_AccessControl() public {
        vm.prank(bank);
        creditScoring.addBeneficiary("Jane Doe", "0987654321", "IFSC002");

        vm.prank(channelPartner);
        creditScoring.updateBeneficiary("Jane Smith", "0987654321", "IFSC002");

        // Test unauthorized access
        vm.prank(auditor);
        vm.expectRevert("CreditScoring: admin or bank required");
        creditScoring.approveLoan("0987654321", "IFSC002", 500);
    }
}
