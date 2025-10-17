// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "./AccessControl.sol";

contract BeneficiaryData {
    AccessControl private accessControl;

    struct Beneficiary {
        string accountHolderName;
        string accountNumber;
        string ifscCode;
        uint256 creditScore; // 0-100
        string riskBand; // e.g., Low Risk - High Need
        bool loanApproved;
        uint256 totalLoanAmount;
        uint256 amountRepaid;
        bytes32 consumptionDataHash; // hash of off-chain consumption data
        uint256 lastUpdated; // timestamp of last update
    }

    mapping(bytes32 => Beneficiary) private beneficiaries;

    event BeneficiaryAdded(string indexed accountNumber, string indexed ifscCode, string accountHolderName);
    event BeneficiaryUpdated(string indexed accountNumber, string indexed ifscCode, string accountHolderName);
    event CreditScoreUpdated(string indexed accountNumber, string indexed ifscCode, uint256 score, string riskBand);
    event LoanApproved(string indexed accountNumber, string indexed ifscCode, uint256 amount);
    event LoanRevoked(string indexed accountNumber, string indexed ifscCode);
    event RepaymentRecorded(string indexed accountNumber, string indexed ifscCode, uint256 amount);
    event RiskBandUpdated(string indexed accountNumber, string indexed ifscCode, string newRiskBand);
    event ConsumptionDataHashUpdated(string indexed accountNumber, string indexed ifscCode, bytes32 newHash);

    constructor(address _accessControl) {
        accessControl = AccessControl(_accessControl);
    }

    modifier onlyAdminOrBank() {
        require(
            accessControl.hasRole(msg.sender, AccessControl.Role.Admin) ||
            accessControl.hasRole(msg.sender, AccessControl.Role.Bank),
            "BeneficiaryData: caller is not admin or bank"
        );
        _;
    }

    modifier onlyAuthorized() {
        require(
            accessControl.hasRole(msg.sender, AccessControl.Role.Admin) ||
            accessControl.hasRole(msg.sender, AccessControl.Role.Bank) ||
            accessControl.hasRole(msg.sender, AccessControl.Role.ChannelPartner),
            "BeneficiaryData: caller not authorized"
        );
        _;
    }

    function addBeneficiary(string calldata _accountHolderName, string calldata _accountNumber, string calldata _ifscCode) external onlyAdminOrBank {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        require(bytes(beneficiaries[key].accountNumber).length == 0, "BeneficiaryData: beneficiary exists");
        beneficiaries[key] = Beneficiary(_accountHolderName, _accountNumber, _ifscCode, 0, "Unknown", false, 0, 0, 0x0, block.timestamp);
        emit BeneficiaryAdded(_accountNumber, _ifscCode, _accountHolderName);
    }

    function updateBeneficiary(string calldata _accountHolderName, string calldata _accountNumber, string calldata _ifscCode) external onlyAuthorized {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        require(bytes(beneficiaries[key].accountNumber).length != 0, "BeneficiaryData: beneficiary not found");
        beneficiaries[key].accountHolderName = _accountHolderName;
        beneficiaries[key].lastUpdated = block.timestamp;
        emit BeneficiaryUpdated(_accountNumber, _ifscCode, _accountHolderName);
    }

    function updateCreditScore(string calldata _accountNumber, string calldata _ifscCode, uint256 _score, string calldata _riskBand) external onlyAuthorized {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        require(bytes(beneficiaries[key].accountNumber).length != 0, "BeneficiaryData: beneficiary not found");
        beneficiaries[key].creditScore = _score;
        beneficiaries[key].riskBand = _riskBand;
        beneficiaries[key].lastUpdated = block.timestamp;
        emit CreditScoreUpdated(_accountNumber, _ifscCode, _score, _riskBand);
    }

    function updateConsumptionDataHash(string calldata _accountNumber, string calldata _ifscCode, bytes32 _hash) external onlyAuthorized {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        require(bytes(beneficiaries[key].accountNumber).length != 0, "BeneficiaryData: beneficiary not found");
        beneficiaries[key].consumptionDataHash = _hash;
        beneficiaries[key].lastUpdated = block.timestamp;
        emit ConsumptionDataHashUpdated(_accountNumber, _ifscCode, _hash);
    }

    function approveLoan(string calldata _accountNumber, string calldata _ifscCode, uint256 _amount) external onlyAdminOrBank {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        Beneficiary storage b = beneficiaries[key];
        require(bytes(b.accountNumber).length != 0, "BeneficiaryData: beneficiary not found");
        require(b.creditScore >= 70, "BeneficiaryData: credit score too low");
        b.loanApproved = true;
        b.totalLoanAmount += _amount;
        b.lastUpdated = block.timestamp;
        emit LoanApproved(_accountNumber, _ifscCode, _amount);
    }

    function revokeLoan(string calldata _accountNumber, string calldata _ifscCode) external onlyAdminOrBank {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        Beneficiary storage b = beneficiaries[key];
        require(b.loanApproved, "BeneficiaryData: loan not approved");
        b.loanApproved = false;
        b.totalLoanAmount = 0;
        b.lastUpdated = block.timestamp;
        emit LoanRevoked(_accountNumber, _ifscCode);
    }

    function recordRepayment(string calldata _accountNumber, string calldata _ifscCode, uint256 _amount) external onlyAuthorized {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        Beneficiary storage b = beneficiaries[key];
        require(b.loanApproved, "BeneficiaryData: loan not approved");

        uint256 repayAmount = _amount;
        if (b.amountRepaid + _amount > b.totalLoanAmount) {
            repayAmount = b.totalLoanAmount - b.amountRepaid;
        }

        b.amountRepaid += repayAmount;
        if (b.amountRepaid >= b.totalLoanAmount) {
            b.riskBand = "Low Risk - Fully Paid";
        }
        b.lastUpdated = block.timestamp;
        emit RepaymentRecorded(_accountNumber, _ifscCode, repayAmount);
    }

    function updateRiskBand(string calldata _accountNumber, string calldata _ifscCode, string calldata _newRiskBand) external onlyAuthorized {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        Beneficiary storage b = beneficiaries[key];
        require(bytes(b.accountNumber).length != 0, "BeneficiaryData: beneficiary not found");
        b.riskBand = _newRiskBand;
        b.lastUpdated = block.timestamp;
        emit RiskBandUpdated(_accountNumber, _ifscCode, _newRiskBand);
    }

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
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        Beneficiary storage b = beneficiaries[key];
        require(bytes(b.accountNumber).length != 0, "BeneficiaryData: beneficiary not found");
        return (
            b.accountHolderName,
            b.accountNumber,
            b.ifscCode,
            b.creditScore,
            b.riskBand,
            b.loanApproved,
            b.totalLoanAmount,
            b.amountRepaid,
            b.consumptionDataHash,
            b.lastUpdated
        );
    }

    function getOutstandingLoan(string calldata _accountNumber, string calldata _ifscCode) external view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        Beneficiary storage b = beneficiaries[key];
        require(bytes(b.accountNumber).length != 0, "BeneficiaryData: beneficiary not found");

        if (b.amountRepaid >= b.totalLoanAmount) {
            return 0;
        }

        return b.totalLoanAmount - b.amountRepaid;
    }
}
