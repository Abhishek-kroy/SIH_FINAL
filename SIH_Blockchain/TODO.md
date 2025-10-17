# TODO: Update Beneficiary Identification to Use AccountHolderName, AccountNumber, IfscCode

## Steps:
- [x] Update src/BeneficiaryData.sol: Change struct, mapping, functions, events to use accountHolderName, accountNumber, ifscCode with bytes32 key.
- [x] Update src/AccessControl.sol: Change beneficiaryAddresses to bytes32 key, update functions and modifiers.
- [ ] Update src/TransactionHistory.sol: Change beneficiaryId to bytes32 in struct and functions.
- [ ] Update src/CreditScoring.sol: Update function signatures to pass accountNumber, ifscCode.
- [ ] Update test/BeneficaryData.t.sol: Update tests for new signatures.
- [ ] Update test/AccessControl.t.sol: Update tests.
- [ ] Update test/TransactionHistory.t.sol: Update tests.
- [ ] Update test/CreditScoring.t.sol: Update tests.
- [ ] Update test/ExtendedCreditScoring.t.sol: Update tests.
- [ ] Run tests to verify changes.
- [ ] Update script/Deploy.s.sol if needed.
