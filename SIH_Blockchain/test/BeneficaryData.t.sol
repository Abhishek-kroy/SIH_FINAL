// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AccessControl} from "../src/AccessControl.sol";
import {BeneficiaryData} from "../src/BeneficiaryData.sol";

contract BeneficiaryDataTest is Test {
    AccessControl public accessControl;
    BeneficiaryData public beneficiaryData;
    event BeneficiaryAdded(string indexed accountNumber, string indexed ifscCode, string accountHolderName);
    event CreditScoreUpdated(string indexed accountNumber, string indexed ifscCode, uint256 score, string riskBand);
    event LoanApproved(string indexed accountNumber, string indexed ifscCode, uint256 amount);
    event LoanRevoked(string indexed accountNumber, string indexed ifscCode);
    event RepaymentRecorded(string indexed accountNumber, string indexed ifscCode, uint256 amount);
    event RiskBandUpdated(string indexed accountNumber, string indexed ifscCode, string newRiskBand);
    event ConsumptionDataHashUpdated(string indexed accountNumber, string indexed ifscCode, bytes32 newHash);
    event BeneficiaryUpdated(string indexed accountNumber, string indexed ifscCode, string accountHolderName);


    address public admin = address(this);
    address public bank = address(0x1);
    address public channelPartner = address(0x2);
    address public auditor = address(0x3);

    function setUp() public {
        accessControl = new AccessControl();
        beneficiaryData = new BeneficiaryData(address(accessControl));

        // Assign roles
        accessControl.assignRole(bank, AccessControl.Role.Bank);
        accessControl.assignRole(channelPartner, AccessControl.Role.ChannelPartner);
        accessControl.assignRole(auditor, AccessControl.Role.Auditor);
    }

    // ------------------------------
    // Basic happy paths
    // ------------------------------

    function testAddBeneficiaryEmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit BeneficiaryAdded("1234567890", "IFSC001", "Alice");

        vm.prank(bank);
        beneficiaryData.addBeneficiary("Alice", "1234567890", "IFSC001");
    }

    function testAddBeneficiaryFailsIfExists() public {
        vm.prank(bank);
        beneficiaryData.addBeneficiary("Bob", "0987654321", "IFSC002");

        vm.prank(bank);
        vm.expectRevert("BeneficiaryData: beneficiary exists");
        beneficiaryData.addBeneficiary("DuplicateBob", "0987654321", "IFSC002");
    }

    function testUpdateBeneficiaryFailsIfNotFound() public {
        vm.prank(channelPartner);
        vm.expectRevert("BeneficiaryData: beneficiary not found");
        beneficiaryData.updateBeneficiary("Nobody", "1111111111", "IFSC003");
    }

    function testUpdateCreditScoreFailsIfNotFound() public {
        vm.prank(channelPartner);
        vm.expectRevert("BeneficiaryData: beneficiary not found");
        beneficiaryData.updateCreditScore("2222222222", "IFSC004", 50, "Band");
    }

    // ------------------------------
    // Loan lifecycle
    // ------------------------------

    function testLoanLifecycle() public {
        vm.prank(bank);
        beneficiaryData.addBeneficiary("Laura", "3333333333", "IFSC010");

        vm.prank(bank);
        beneficiaryData.updateCreditScore("3333333333", "IFSC010", 80, "Low Risk");

        vm.prank(bank);
        beneficiaryData.approveLoan("3333333333", "IFSC010", 5000);

        vm.prank(bank);
        beneficiaryData.recordRepayment("3333333333", "IFSC010", 2000);

        vm.prank(bank);
        beneficiaryData.revokeLoan("3333333333", "IFSC010");

        (, , , , , bool approved, uint256 totalLoan, uint256 repaid, , ) = beneficiaryData.getBeneficiary("3333333333", "IFSC010");
        assertFalse(approved);
        assertEq(totalLoan, 0);
        assertEq(repaid, 2000);
    }

    function testOutstandingLoanCalculation() public {
        vm.prank(bank);
        beneficiaryData.addBeneficiary("Mia", "4444444444", "IFSC011");

        vm.prank(bank);
        beneficiaryData.updateCreditScore("4444444444", "IFSC011", 90, "Low Risk");

        vm.prank(bank);
        beneficiaryData.approveLoan("4444444444", "IFSC011", 4000);

        vm.prank(bank);
        beneficiaryData.recordRepayment("4444444444", "IFSC011", 1500);

        uint256 outstanding = beneficiaryData.getOutstandingLoan("4444444444", "IFSC011");
        assertEq(outstanding, 2500);
    }

    // ------------------------------
    // Edge Cases
    // ------------------------------

    function testFullRepaymentUpdatesRiskBand() public {
        vm.prank(bank);
        beneficiaryData.addBeneficiary("Nina", "5555555555", "IFSC012");

        vm.prank(bank);
        beneficiaryData.updateCreditScore("5555555555", "IFSC012", 85, "Medium Risk");

        vm.prank(bank);
        beneficiaryData.approveLoan("5555555555", "IFSC012", 1000);

        vm.prank(bank);
        beneficiaryData.recordRepayment("5555555555", "IFSC012", 1000);

        (, , , , string memory riskBand, , , , , ) = beneficiaryData.getBeneficiary("5555555555", "IFSC012");
        assertEq(riskBand, "Low Risk - Fully Paid");
    }

    function testRevokeLoanFailsIfNotApproved() public {
        vm.prank(bank);
        beneficiaryData.addBeneficiary("Oscar", "6666666666", "IFSC013");

        vm.prank(bank);
        vm.expectRevert("BeneficiaryData: loan not approved");
        beneficiaryData.revokeLoan("6666666666", "IFSC013");
    }

    function testUpdateConsumptionDataHash() public {
        vm.prank(bank);
        beneficiaryData.addBeneficiary("Paul", "7777777777", "IFSC014");

        bytes32 fakeHash = keccak256("sample_data");
        vm.prank(channelPartner);
        beneficiaryData.updateConsumptionDataHash("7777777777", "IFSC014", fakeHash);

        (, , , , , , , , bytes32 savedHash, ) = beneficiaryData.getBeneficiary("7777777777", "IFSC014");
        assertEq(savedHash, fakeHash);
    }

    function testUpdateRiskBandDirectly() public {
        vm.prank(bank);
        beneficiaryData.addBeneficiary("Quinn", "8888888888", "IFSC015");

        vm.prank(channelPartner);
        beneficiaryData.updateRiskBand("8888888888", "IFSC015", "Critical Risk");

        (, , , , string memory band, , , , ,  ) = beneficiaryData.getBeneficiary("8888888888", "IFSC015");
        assertEq(band, "Critical Risk");
    }

    // ------------------------------
    // Unauthorized access
    // ------------------------------

    function testNonAuthorizedCannotAddBeneficiary() public {
        vm.prank(channelPartner); // only bank or admin allowed
        vm.expectRevert("BeneficiaryData: caller is not admin or bank");
        beneficiaryData.addBeneficiary("Sam", "9999999999", "IFSC016");
    }

    function testUnauthorizedRepaymentFails() public {
        vm.prank(bank);
        beneficiaryData.addBeneficiary("Tina", "0000000000", "IFSC017");
        vm.prank(bank);
        beneficiaryData.updateCreditScore("0000000000", "IFSC017", 80, "Low Risk");
        vm.prank(bank);
        beneficiaryData.approveLoan("0000000000", "IFSC017", 500);

        vm.prank(auditor); // not authorized
        vm.expectRevert("BeneficiaryData: caller not authorized");
        beneficiaryData.recordRepayment("0000000000", "IFSC017", 100);
    }

    // ------------------------------
    // Fuzzing
    // ------------------------------

    function testFuzzAddAndGetBeneficiary(string memory benId, string memory name) public {
        vm.assume(bytes(benId).length > 0);
        vm.assume(bytes(name).length > 0);

        vm.prank(bank);
        beneficiaryData.addBeneficiary(name, benId, "IFSCFUZZ");

        (string memory savedName, string memory savedId, , , , , , , , ) = beneficiaryData.getBeneficiary(benId, "IFSCFUZZ");
        assertEq(savedName, name);
        assertEq(savedId, benId);
    }

    function testFuzzRepaymentNeverExceedsLoan(string memory benId, uint256 loan, uint256 repay) public {
        vm.assume(bytes(benId).length > 0);
        vm.assume(loan > 0 && loan < 1e18);
        vm.assume(repay > 0 && repay < 2e18);

        vm.prank(bank);
        beneficiaryData.addBeneficiary("FuzzUser", benId, "IFSCFUZZ2");

        vm.prank(bank);
        beneficiaryData.updateCreditScore(benId, "IFSCFUZZ2", 80, "Low Risk");

        vm.prank(bank);
        beneficiaryData.approveLoan(benId, "IFSCFUZZ2", loan);

        vm.prank(bank);
        beneficiaryData.recordRepayment(benId, "IFSCFUZZ2", repay);

        (, , , , , , uint256 totalLoan, uint256 amountRepaid, , ) = beneficiaryData.getBeneficiary(benId, "IFSCFUZZ2");
        assertLe(amountRepaid, totalLoan);
    }
} 