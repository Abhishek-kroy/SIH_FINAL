// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "./AccessControl.sol";
import {BeneficiaryData} from "./BeneficiaryData.sol";
import {TransactionHistory} from "./TransactionHistory.sol";

contract CreditScoring {
    AccessControl private accessControl;
    BeneficiaryData private beneficiaryData;
    TransactionHistory private transactionHistory;

    constructor(address _accessControl, address _beneficiaryData, address _transactionHistory) {
        accessControl = AccessControl(_accessControl);
        beneficiaryData = BeneficiaryData(_beneficiaryData);
        transactionHistory = TransactionHistory(_transactionHistory);
        // // Make this contract admin to assign roles
        // accessControl.assignRole(address(this), AccessControl.Role.Admin);
    }

    modifier onlyAdmin() {
        require(accessControl.hasRole(msg.sender, AccessControl.Role.Admin), "CreditScoring: only admin");
        _;
    }

    modifier onlyAdminOrBank() {
        require(
            accessControl.hasRole(msg.sender, AccessControl.Role.Admin) ||
            accessControl.hasRole(msg.sender, AccessControl.Role.Bank) ||
            msg.sender == address(this),
            "CreditScoring: admin or bank required"
        );
        _;
    }

    modifier onlyAuthorized() {
        require(
            accessControl.hasRole(msg.sender, AccessControl.Role.Admin) ||
            accessControl.hasRole(msg.sender, AccessControl.Role.Bank) ||
            accessControl.hasRole(msg.sender, AccessControl.Role.ChannelPartner) ||
            msg.sender == address(this),
            "CreditScoring: caller not authorized"
        );
        _;
    }

    // ------------------ Access Control Operations ------------------
    function assignRole(address _account, AccessControl.Role _role) external onlyAdmin {
        accessControl.assignRole(_account, _role);
    }

    function setBeneficiaryAddress(string calldata _accountNumber, string calldata _ifscCode, address _account) external onlyAdminOrBank {
        accessControl.setBeneficiaryAddress(_accountNumber, _ifscCode, _account);
    }

    function getRole(address _account) external view returns (AccessControl.Role) {
        return accessControl.getRole(_account);
    }

    // ------------------ Beneficiary Operations ------------------
    function addBeneficiary(string calldata _accountHolderName, string calldata _accountNumber, string calldata _ifscCode) external onlyAdminOrBank {
        beneficiaryData.addBeneficiary(_accountHolderName, _accountNumber, _ifscCode);
        transactionHistory.recordTransaction(_accountNumber, _ifscCode, "BeneficiaryAdded", 0, string(abi.encodePacked("Name: ", _accountHolderName)));
    }

    function updateBeneficiary(string calldata _accountHolderName, string calldata _accountNumber, string calldata _ifscCode) external onlyAuthorized {
        beneficiaryData.updateBeneficiary(_accountHolderName, _accountNumber, _ifscCode);
        transactionHistory.recordTransaction(_accountNumber, _ifscCode, "BeneficiaryUpdated", 0, string(abi.encodePacked("New Name: ", _accountHolderName)));
    }

    // ------------------ Credit Score Operations ------------------
    function updateCreditScore(string calldata _accountNumber, string calldata _ifscCode, uint256 _score, string calldata _riskBand) external onlyAuthorized {
        beneficiaryData.updateCreditScore(_accountNumber, _ifscCode, _score, _riskBand);
        transactionHistory.recordTransaction(_accountNumber, _ifscCode, "CreditScoreUpdated", _score, string(abi.encodePacked("Risk Band: ", _riskBand)));
    }

    function updateConsumptionDataHash(string calldata _accountNumber, string calldata _ifscCode, bytes32 _hash) external onlyAuthorized {
        beneficiaryData.updateConsumptionDataHash(_accountNumber, _ifscCode, _hash);
        transactionHistory.recordTransaction(_accountNumber, _ifscCode, "ConsumptionDataHashUpdated", 0, "Hash updated for verification");
    }

    // ------------------ Loan Operations ------------------
    function approveLoan(string calldata _accountNumber, string calldata _ifscCode, uint256 _amount) external onlyAdminOrBank {
        beneficiaryData.approveLoan(_accountNumber, _ifscCode, _amount);
        transactionHistory.recordTransaction(_accountNumber, _ifscCode, "LoanApproved", _amount, "Loan approved");
    }

    function revokeLoan(string calldata _accountNumber, string calldata _ifscCode) external onlyAdminOrBank {
        beneficiaryData.revokeLoan(_accountNumber, _ifscCode);
        transactionHistory.recordTransaction(_accountNumber, _ifscCode, "LoanRevoked", 0, "Loan revoked");
    }

    // ------------------ Repayment Operations ------------------
    function recordRepayment(string calldata _accountNumber, string calldata _ifscCode, uint256 _amount) external onlyAuthorized {
        beneficiaryData.recordRepayment(_accountNumber, _ifscCode, _amount);
        transactionHistory.recordTransaction(_accountNumber, _ifscCode, "RepaymentRecorded", _amount, "Repayment made");
    }

    function updateRiskBand(string calldata _accountNumber, string calldata _ifscCode, string calldata _newRiskBand) external onlyAuthorized {
        beneficiaryData.updateRiskBand(_accountNumber, _ifscCode, _newRiskBand);
        transactionHistory.recordTransaction(_accountNumber, _ifscCode, "RiskBandUpdated", 0, string(abi.encodePacked("New Band: ", _newRiskBand)));
    }

    // ------------------ Getter Functions ------------------
    function getBeneficiary(string calldata _accountNumber, string calldata _ifscCode) external view returns (
        string memory accountHolderName,
        string memory accountNumber,
        string memory ifscCode,
        uint256 creditScore,
        string memory riskBand,
        bool loanApproved,
        uint256 totalLoanAmount,
        uint256 amountRepaid,
        bytes32 consumptionDataHash,
        uint256 lastUpdated
    ) {
        return beneficiaryData.getBeneficiary(_accountNumber, _ifscCode);
    }

    function getOutstandingLoan(string calldata _accountNumber, string calldata _ifscCode) external view returns (uint256) {
        return beneficiaryData.getOutstandingLoan(_accountNumber, _ifscCode);
    }

    // ------------------ Transaction History ------------------
    function getTransactionCount() external view returns (uint256) {
        return transactionHistory.getTransactionCount();
    }

    function getTransaction(uint256 _index) external view returns (
    uint256 amount,
    uint256 timestamp,
    bytes32 beneficiaryKey,
    string memory txType,
    string memory details
) {
    return transactionHistory.getTransaction(_index);
}
}
