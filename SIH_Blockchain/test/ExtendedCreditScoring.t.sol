// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {CreditScoring} from "../src/CreditScoring.sol";
import {AccessControl} from "../src/AccessControl.sol";
import {BeneficiaryData} from "../src/BeneficiaryData.sol";
import {TransactionHistory} from "../src/TransactionHistory.sol";
import {console2} from "forge-std/console2.sol";
import {DeployCreditScoring} from "../script/Deploy.s.sol";

contract ExtendedCreditScoringTest is Test {
    CreditScoring public creditScoring;
    AccessControl public accessControl;
    BeneficiaryData public beneficiaryData;
    TransactionHistory public transactionHistory;

    address public admin;
    address public bank;
    address public channelPartner;
    address public auditor;
    address public beneficiary;

    function setUp() public {
        // Use Deploy.s.sol to deploy contracts
        DeployCreditScoring deployer = new DeployCreditScoring();
        (creditScoring, accessControl, beneficiaryData, transactionHistory) = deployer.deployContracts(address(this));

        // Assign roles
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

    // Unit tests for AccessControl
    function testAssignRoleByAdmin() public {
        vm.prank(admin);
        creditScoring.assignRole(address(0x5), AccessControl.Role.Bank);
        assertEq(uint(accessControl.getRole(address(0x5))), uint(AccessControl.Role.Bank));
    }

    function testAssignRoleByNonAdminFails() public {
        vm.prank(bank);
        vm.expectRevert("CreditScoring: only admin");
        creditScoring.assignRole(address(0x6), AccessControl.Role.Bank);
    }

    // Unit tests for BeneficiaryData through CreditScoring
    function testAddBeneficiaryAndGet() public {
        vm.prank(bank);
        creditScoring.addBeneficiary("Alice", "1234567890", "IFSC001");
        (string memory name, , , , , , , , , ) = creditScoring.getBeneficiary("1234567890", "IFSC001");
        assertEq(name, "Alice");
    }

    function testUpdateCreditScoreAndRiskBand() public {
        vm.prank(bank);
        creditScoring.addBeneficiary("Bob", "0987654321", "IFSC002");
        vm.prank(channelPartner);
        creditScoring.updateCreditScore("0987654321", "IFSC002", 90, "Low Risk");
        (, , , uint256 score, string memory band, , , , , ) = creditScoring.getBeneficiary("0987654321", "IFSC002");
        assertEq(score, 90);
        assertEq(band, "Low Risk");
    }

    // Integration test: simulate loan approval and repayment
    function testLoanApprovalAndRepaymentFlow() public {
        vm.prank(bank);
        creditScoring.addBeneficiary("Charlie", "1111111111", "IFSC003");
        vm.prank(bank);
        creditScoring.updateCreditScore("1111111111", "IFSC003", 75, "Medium Risk");
        vm.prank(bank);
        creditScoring.approveLoan("1111111111", "IFSC003", 10000);

        (, , , , , bool approved, uint256 amount, , , ) = creditScoring.getBeneficiary("1111111111", "IFSC003");
        assertTrue(approved);
        assertEq(amount, 10000);

        vm.prank(bank);
        creditScoring.recordRepayment("1111111111", "IFSC003", 4000);
        (, , , , , , , uint256 repaid, , ) = creditScoring.getBeneficiary("1111111111", "IFSC003");
        assertEq(repaid, 4000);

        uint256 outstanding = creditScoring.getOutstandingLoan("1111111111", "IFSC003");
        assertEq(outstanding, 6000);
    }

    // System level test: simulate transactions between bank and beneficiary on Anvil fork
   function testSimulateBankBeneficiaryTransactions() public {
    // Fork Anvil at block 0
    vm.createSelectFork(vm.envString("ANVIL_RPC_URL"));

    // Deploy contracts using Deploy.s.sol
    DeployCreditScoring deployer = new DeployCreditScoring();
    (creditScoring, accessControl, beneficiaryData, transactionHistory) = deployer.deployContracts(address(this));

    // Initialize addresses
    bank = address(0x1);
    beneficiary = address(0x4);

    // Assign roles
    accessControl.assignRole(address(creditScoring), AccessControl.Role.Admin);
    accessControl.assignRole(bank, AccessControl.Role.Bank);
    accessControl.assignRole(beneficiary, AccessControl.Role.Beneficiary);

    // CreditScoring assigns roles
    vm.prank(address(creditScoring));
    creditScoring.assignRole(bank, AccessControl.Role.Bank);
    console.log("Bank role assigned to:", bank);

    // Bank adds beneficiary
    vm.prank(bank);
    creditScoring.addBeneficiary("Diana", "2222222222", "IFSC004");
    console.log("Beneficiary added: 2222222222 -> Diana");

    // Bank updates credit score
    vm.prank(bank);
    creditScoring.updateCreditScore("2222222222", "IFSC004", 80, "Low Risk");
    console.log("Credit score updated for 2222222222: 80, Low Risk");

    // Bank approves loan
    vm.prank(bank);
    creditScoring.approveLoan("2222222222", "IFSC004", 5000);
    console.log("Loan approved for 2222222222: 5000");

    // Beneficiary repays loan
    // Bank records repayment on behalf of beneficiary
    vm.prank(bank);
    creditScoring.recordRepayment("2222222222", "IFSC004", 2000);
    console.log("Repayment recorded by bank: 2000");

    // Check loan status
    (, , , , , bool approved, uint256 amount, uint256 repaid, , ) = creditScoring.getBeneficiary("2222222222", "IFSC004");
    console.log("Loan approved:", approved);
    console.log("Loan amount:", amount);
    console.log("Loan repaid:", repaid);

    assertTrue(approved, "Loan should be approved");
    assertEq(amount, 5000, "Loan amount mismatch");
    assertEq(repaid, 2000, "Repayment amount mismatch");
}

    // Edge case tests
    function testApproveLoanWithLowCreditScoreFails() public {
        vm.prank(bank);
        creditScoring.addBeneficiary("Eve", "3333333333", "IFSC005");
        vm.prank(bank);
        creditScoring.updateCreditScore("3333333333", "IFSC005", 60, "High Risk");

        vm.prank(bank);
        vm.expectRevert("BeneficiaryData: credit score too low");
        creditScoring.approveLoan("3333333333", "IFSC005", 1000);
    }

    function testRevokeLoanWithoutApprovalFails() public {
        vm.prank(bank);
        creditScoring.addBeneficiary("Frank", "4444444444", "IFSC006");

        vm.prank(bank);
        vm.expectRevert("BeneficiaryData: loan not approved");
        creditScoring.revokeLoan("4444444444", "IFSC006");
    }

    function testRepaymentWithoutLoanApprovalFails() public {
        vm.prank(bank);
        creditScoring.addBeneficiary("Grace", "5555555555", "IFSC007");

        vm.prank(bank);
        vm.expectRevert("BeneficiaryData: loan not approved");
        creditScoring.recordRepayment("5555555555", "IFSC007", 500);
    }

    // Additional fuzz test: loan approval amount should be positive
    function testFuzzLoanApprovalAmountPositive(uint256 amount) public {
        vm.assume(amount > 0 && amount < 1e18);
        vm.prank(bank);
        creditScoring.addBeneficiary("FuzzUser", "6666666666", "IFSC008");
        vm.prank(bank);
        creditScoring.updateCreditScore("6666666666", "IFSC008", 80, "Low Risk");
        vm.prank(bank);
        creditScoring.approveLoan("6666666666", "IFSC008", amount);
        (, , , , , bool approved, uint256 loanAmount, , , ) = creditScoring.getBeneficiary("6666666666", "IFSC008");
        assertTrue(approved);
        assertEq(loanAmount, amount);
    }

    // Invariant test: total repaid should never exceed loan amount
    function testInvariant_RepaidNotExceedLoan() public {
        vm.prank(bank);
        creditScoring.addBeneficiary("InvariantUser", "7777777777", "IFSC009");
        vm.prank(bank);
        creditScoring.updateCreditScore("7777777777", "IFSC009", 85, "Medium Risk");
        vm.prank(bank);
        creditScoring.approveLoan("7777777777", "IFSC009", 1000);

        vm.prank(bank);
        creditScoring.recordRepayment("7777777777", "IFSC009", 500);

        (, , , , , , uint256 loanAmount, uint256 repaid, , ) = creditScoring.getBeneficiary("7777777777", "IFSC009");
        assertLe(repaid, loanAmount);

        // Try to repay more than loan amount
        vm.prank(bank);
        creditScoring.recordRepayment("7777777777", "IFSC009", 600);

        assertLe(repaid, loanAmount);
    }

    // Edge case: unauthorized role assignment should revert
    function testUnauthorizedRoleAssignmentReverts() public {
        vm.prank(auditor);
        vm.expectRevert("CreditScoring: only admin");
        creditScoring.assignRole(address(0x9), AccessControl.Role.Bank);
    }

    // Edge case: approve loan without credit score should revert
    function testApproveLoanWithoutCreditScoreReverts() public {
        vm.prank(bank);
        creditScoring.addBeneficiary("NoScoreUser", "8888888888", "IFSC010");
        vm.prank(bank);
        vm.expectRevert("BeneficiaryData: credit score too low");
        creditScoring.approveLoan("8888888888", "IFSC010", 1000);
    }
}
