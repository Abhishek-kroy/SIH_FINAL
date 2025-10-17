// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AccessControl {
    enum Role { None, Admin, Bank, ChannelPartner, Auditor, Beneficiary }

    mapping(address => Role) private roles;
    mapping(bytes32 => address) private beneficiaryAddresses; // Map beneficiary key to address for self-access

    event RoleAssigned(address indexed account, Role role);
    event RoleRevoked(address indexed account, Role role);
    event BeneficiaryAddressSet(string indexed accountNumber, string indexed ifscCode, address indexed account);

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "AccessControl: insufficient permissions");
        _;
    }

    modifier onlyAdminOrBank() {
        require(
            roles[msg.sender] == Role.Admin || roles[msg.sender] == Role.Bank,
            "AccessControl: admin or bank required"
        );
        _;
    }

    modifier onlyBeneficiary(string memory _accountNumber, string memory _ifscCode) {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        require(beneficiaryAddresses[key] == msg.sender, "AccessControl: only beneficiary can access");
        _;
    }

    constructor() {
        roles[msg.sender] = Role.Admin; // Deployer is admin
        emit RoleAssigned(msg.sender, Role.Admin);
    }

    function assignRole(address _account, Role _role) external onlyRole(Role.Admin) {
        roles[_account] = _role;
        emit RoleAssigned(_account, _role);
    }

    function getBeneficiaryAddress(string calldata _accountNumber, string calldata _ifscCode) public view returns (address) {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        return beneficiaryAddresses[key];
    }

    function assignRoleByBeneficiary(string calldata _accountNumber, string calldata _ifscCode, Role _role) external onlyRole(Role.Admin) {
        address account = getBeneficiaryAddress(_accountNumber, _ifscCode);
        require(account != address(0), "AccessControl: beneficiary address not set");
        roles[account] = _role;
        emit RoleAssigned(account, _role);
    }

    function removeRole(address _account) external onlyRole(Role.Admin) {
        Role previousRole = roles[_account];
        require(previousRole != Role.None, "AccessControl: no role assigned");
        roles[_account] = Role.None;
        emit RoleRevoked(_account, previousRole);
    }

    function removeRoleByBeneficiary(string calldata _accountNumber, string calldata _ifscCode) external onlyRole(Role.Admin) {
        address account = getBeneficiaryAddress(_accountNumber, _ifscCode);
        require(account != address(0), "AccessControl: beneficiary address not set");
        Role previousRole = roles[account];
        require(previousRole != Role.None, "AccessControl: no role assigned");
        roles[account] = Role.None;
        emit RoleRevoked(account, previousRole);
    }

    function setBeneficiaryAddress(string calldata _accountNumber, string calldata _ifscCode, address _account) external onlyAdminOrBank {
        bytes32 key = keccak256(abi.encodePacked(_accountNumber, _ifscCode));
        beneficiaryAddresses[key] = _account;
        emit BeneficiaryAddressSet(_accountNumber, _ifscCode, _account);
    }

    function getRole(address _account) external view returns (Role) {
        return roles[_account];
    }

    function hasRole(address _account, Role _role) external view returns (bool) {
        return roles[_account] == _role;
    }
} 