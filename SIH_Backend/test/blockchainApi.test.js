const request = require('supertest');
const app = require('../index'); // Assuming index.js exports the express app
const { initBlockchain, getContract } = require('../utils/blockchain');

beforeAll(async () => {
  // Initialize blockchain connection
  initBlockchain();
});

describe('Blockchain API Endpoints', () => {
  let tokenAdmin;
  let tokenBank;
  let tokenBeneficiary;
  let accountNumber = '1234567890';
  let ifscCode = 'SBIN0001234';
  let accountHolderName = 'Test Beneficiary';

  // Helper to login and get token
  async function loginUser(email, password) {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });
    return res.body.token;
  }

  test('Login as Admin', async () => {
    tokenAdmin = await loginUser('admin@example.com', 'password123');
    expect(tokenAdmin).toBeDefined();
  });

  test('Login as Bank', async () => {
    tokenBank = await loginUser('bank@example.com', 'password123');
    expect(tokenBank).toBeDefined();
  });

  test('Login as Beneficiary', async () => {
    tokenBeneficiary = await loginUser('beneficiary@example.com', 'password123');
    expect(tokenBeneficiary).toBeDefined();
  });

  test('Assign Role (Admin only)', async () => {
    const res = await request(app)
      .post('/api/v1/blockchain/roles/assign')
      .set('Cookie', [`token=${tokenAdmin}`])
      .send({ accountNumber: '1234567890', ifscCode: 'SBIN0001234', role: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Remove Role (Admin only)', async () => {
    // First set beneficiary address
    await request(app)
      .post('/api/v1/blockchain/roles/set-beneficiary-address')
      .set('Cookie', [`token=${tokenBank}`])
      .send({ accountNumber: '1234567890', ifscCode: 'SBIN0001234', address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' });

    const res = await request(app)
      .post('/api/v1/blockchain/roles/remove')
      .set('Cookie', [`token=${tokenAdmin}`])
      .send({ accountNumber: '1234567890', ifscCode: 'SBIN0001234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Set Beneficiary Address (Bank only)', async () => {
    const res = await request(app)
      .post('/api/v1/blockchain/roles/set-beneficiary-address')
      .set('Cookie', [`token=${tokenBank}`])
      .send({ accountNumber: '1234567890', ifscCode: 'SBIN0001234', address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Add Beneficiary (Bank only)', async () => {
    const res = await request(app)
      .post('/api/v1/blockchain/beneficiaries/add')
      .set('Cookie', [`token=${tokenBank}`])
      .send({ accountHolderName, accountNumber, ifscCode });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Get Beneficiary Data', async () => {
    const res = await request(app)
      .get(`/api/v1/blockchain/beneficiaries/${accountNumber}/${ifscCode}`)
      .set('Cookie', [`token=${tokenBeneficiary}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.beneficiary).toBeDefined();
  });

  test('Approve Loan (Bank only)', async () => {
    const res = await request(app)
      .post(`/api/v1/blockchain/beneficiaries/${accountNumber}/${ifscCode}/loan/approve`)
      .set('Cookie', [`token=${tokenBank}`])
      .send({ amount: 1000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Record Repayment (Beneficiary only)', async () => {
    const res = await request(app)
      .post(`/api/v1/blockchain/beneficiaries/${accountNumber}/${ifscCode}/repayment`)
      .set('Cookie', [`token=${tokenBeneficiary}`])
      .send({ amount: 200 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Get Transactions for Beneficiary', async () => {
    const res = await request(app)
      .get(`/api/v1/blockchain/beneficiaries/${accountNumber}/${ifscCode}/transactions`)
      .set('Cookie', [`token=${tokenBeneficiary}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transactions).toBeDefined();
    expect(Array.isArray(res.body.transactions)).toBe(true);
  });

  test('Health Check', async () => {
    const res = await request(app)
      .get('/api/v1/blockchain/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.network).toBeDefined();
  });
});
