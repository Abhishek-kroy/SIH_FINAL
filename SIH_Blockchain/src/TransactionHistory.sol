// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TransactionHistory {
    struct Transaction {
        bytes32 beneficiaryKey;
        string txType; // e.g., "LoanIssued", "Repayment", "ScoreUpdated"
        uint256 amount;
        uint256 timestamp;
        string details; // optional additional info
    }

    Transaction[] private transactions;

    event TransactionRecorded(
        bytes32 indexed beneficiaryKey,
        string txType,
        uint256 amount,
        uint256 timestamp,
        string details
    );

    function recordTransaction(
        string calldata _accountNumber,
        string calldata _ifscCode,
        string calldata _txType,
        uint256 _amount,
        string calldata _details
    ) external {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        transactions.push(Transaction({
            beneficiaryKey: key,
            txType: _txType,
            amount: _amount,
            timestamp: block.timestamp,
            details: _details
        }));

        emit TransactionRecorded(key, _txType, _amount, block.timestamp, _details);
    }

    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 _index) external view returns (
        uint256 amount,
        uint256 timestamp,
        bytes32 beneficiaryKey,
        string memory txType,
        string memory details
    ) {
        require(_index < transactions.length, "TransactionHistory: index out of bounds");
        Transaction storage txn = transactions[_index];
        return (txn.amount, txn.timestamp, txn.beneficiaryKey, txn.txType, txn.details);
    }

    function getTransactionCountForBeneficiary(string calldata _accountNumber, string calldata _ifscCode) external view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        uint256 count = 0;
        for (uint256 i = 0; i < transactions.length; i++) {
            if (transactions[i].beneficiaryKey == key) {
                count++;
            }
        }
        return count;
    }
}
