// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TransactionHistory} from "../src/TransactionHistory.sol";

contract TransactionHistoryTest is Test {
    TransactionHistory public transactionHistory;
    event TransactionRecorded(
        string beneficiaryId,
        string txType,
        uint256 amount,
        uint256 timestamp,
        string details
    );

    

    function setUp() public {
        transactionHistory = new TransactionHistory();
    }

    function testRecordTransactionAndGetCount() public {
        transactionHistory.recordTransaction("BEN001", "IFSC001", "LoanIssued", 1000, "Initial loan");
        uint256 count = transactionHistory.getTransactionCount();
        assertEq(count, 1);
    }

    function testGetTransactionReturnsCorrectData() public {
        transactionHistory.recordTransaction("BEN002", "IFSC002", "Repayment", 500, "Partial repayment");
        (
            uint256 amount,
            uint256 timestamp,
            bytes32 beneficiaryKey,
            string memory txType,
            string memory details
        ) = transactionHistory.getTransaction(0);

        bytes32 expectedKey = keccak256(abi.encodePacked("BEN002", "IFSC002"));
        assertEq(beneficiaryKey, expectedKey);
        assertEq(txType, "Repayment");
        assertEq(amount, 500);
        assertGt(timestamp, 0);
        assertEq(details, "Partial repayment");
    }

    function testTransactionRecordedEventEmitted() public {
        transactionHistory.recordTransaction("BEN003", "IFSC003", "ScoreUpdated", 0, "Updated credit score");

        uint256 count = transactionHistory.getTransactionCount();
        assertEq(count, 1);

        (uint256 amount, uint256 timestamp, bytes32 beneficiaryKey, string memory txType, string memory details) = transactionHistory.getTransaction(0);
        bytes32 expectedKey = keccak256(abi.encodePacked("BEN003", "IFSC003"));
        assertEq(beneficiaryKey, expectedKey);
        assertEq(txType, "ScoreUpdated");
        assertEq(amount, 0);
        assertGt(timestamp, 0);
        assertEq(details, "Updated credit score");
    }

    function testGetTransactionOutOfBoundsReverts() public {
        vm.expectRevert("TransactionHistory: index out of bounds");
        transactionHistory.getTransaction(0);
    }

    function testMultipleTransactions() public {
        transactionHistory.recordTransaction("BEN004", "IFSC004", "LoanIssued", 2000, "Loan issued");
        transactionHistory.recordTransaction("BEN004", "IFSC004", "Repayment", 1000, "First repayment");
        transactionHistory.recordTransaction("BEN004", "IFSC004", "Repayment", 500, "Second repayment");

        uint256 count = transactionHistory.getTransactionCount();
        assertEq(count, 3);

        (uint256 amount, , bytes32 beneficiaryKey, string memory txType, ) = transactionHistory.getTransaction(1);
        bytes32 expectedKey = keccak256(abi.encodePacked("BEN004", "IFSC004"));
        assertEq(beneficiaryKey, expectedKey);
        assertEq(txType, "Repayment");
        assertEq(amount, 1000);
    }

    function testGetTransactionCountForBeneficiary() public {
        transactionHistory.recordTransaction("BEN005", "IFSC005", "LoanIssued", 1500, "Loan for BEN005");
        transactionHistory.recordTransaction("BEN006", "IFSC006", "Repayment", 750, "Repayment for BEN006");
        transactionHistory.recordTransaction("BEN005", "IFSC005", "Repayment", 500, "Repayment for BEN005");
        transactionHistory.recordTransaction("BEN007", "IFSC007", "ScoreUpdated", 0, "Score update for BEN007");

        uint256 countBEN005 = transactionHistory.getTransactionCountForBeneficiary("BEN005", "IFSC005");
        uint256 countBEN006 = transactionHistory.getTransactionCountForBeneficiary("BEN006", "IFSC006");
        uint256 countBEN007 = transactionHistory.getTransactionCountForBeneficiary("BEN007", "IFSC007");
        uint256 countBEN008 = transactionHistory.getTransactionCountForBeneficiary("BEN008", "IFSC008");

        assertEq(countBEN005, 2);
        assertEq(countBEN006, 1);
        assertEq(countBEN007, 1);
        assertEq(countBEN008, 0);
    }
}
