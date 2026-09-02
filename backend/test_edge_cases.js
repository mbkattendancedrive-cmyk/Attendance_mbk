import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/Lenovo/Desktop/ID_Scan/backend/.env' });

const API_BASE = 'http://127.0.0.1:5000/api';

async function runEdgeCaseTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND EDGE CASE TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`, details);
      failed++;
    }
  }

  let adminToken = '';
  let employeeToken = '';

  // Setup tokens
  try {
    const adminRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@company.com', password: 'password123' })
    });
    const adminData = await adminRes.json();
    adminToken = adminData.token;

    const empRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'EMP001', password: 'Password@123' })
    });
    const empData = await empRes.json();
    employeeToken = empData.token;
  } catch (err) {
    console.error('Failed to setup tokens for testing', err);
    return;
  }

  // --- 1. AUTHENTICATION EDGE CASES ---
  console.log('\n--- 1. AUTHENTICATION EDGE CASES ---');

  // 1.1 Invalid Password
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@company.com', password: 'wrongpassword' })
    });
    assert(res.status === 401 || res.status === 400, 'Login with incorrect password rejected', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Login with incorrect password request failed', err.message);
  }

  // 1.2 Non-existent user
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@company.com', password: 'password123' })
    });
    assert(res.status === 401 || res.status === 404 || res.status === 400, 'Login with non-existent email rejected', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Login with non-existent email request failed', err.message);
  }

  // 1.3 Empty credentials
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' })
    });
    assert(res.status >= 400, 'Login with empty body/credentials rejected', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Login with empty credentials failed', err.message);
  }

  // 1.4 Access protected route without authorization header
  try {
    const res = await fetch(`${API_BASE}/employees`);
    assert(res.status === 401, 'GET /api/employees without auth header rejected (401)', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Unauthenticated GET /api/employees failed', err.message);
  }

  // 1.5 Access protected route with invalid/malformed token
  try {
    const res = await fetch(`${API_BASE}/employees`, {
      headers: { 'Authorization': 'Bearer invalid_token_xyz_123' }
    });
    assert(res.status === 401, 'GET /api/employees with invalid token rejected (401)', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Invalid token GET /api/employees failed', err.message);
  }


  // --- 2. AUTHORIZATION & ROLE PRIVILEGE EDGE CASES ---
  console.log('\n--- 2. AUTHORIZATION EDGE CASES ---');

  // 2.1 Non-admin employee trying to access admin-only endpoint (e.g. create employee)
  try {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${employeeToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Unauthorized User',
        email: 'unauth@company.com',
        phone: '1234567890',
        department: 'IT',
        designation: 'Tester',
        dateOfBirth: '2000-01-01',
        joiningDate: '2026-01-01',
        address: 'Test Address',
        emergencyContact: '0987654321',
        bloodGroup: 'A+'
      })
    });
    assert(res.status === 403 || res.status === 401, 'Employee creating new employee forbidden (403/401)', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Role authorization check failed', err.message);
  }


  // --- 3. MONGO OBJECTID & RESOURCE NOT FOUND EDGE CASES ---
  console.log('\n--- 3. INVALID ID & NOT FOUND EDGE CASES ---');

  // 3.1 Fetch non-existent MongoDB ObjectId (valid format, but doesn't exist)
  try {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await fetch(`${API_BASE}/employees/${fakeId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(res.status === 404, 'GET employee with non-existent ID returns 404', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Non-existent employee fetch test failed', err.message);
  }

  // 3.2 Malformed MongoDB ObjectId
  try {
    const malformedId = 'invalid-mongo-id-123';
    const res = await fetch(`${API_BASE}/employees/${malformedId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(res.status === 400 || res.status === 404 || res.status === 500, 'GET employee with malformed ID handled safely without crash', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Malformed ID test failed', err.message);
  }

  // 3.3 Delete non-existent employee ID
  try {
    const fakeId = '507f1f77bcf86cd799439022';
    const res = await fetch(`${API_BASE}/employees/${fakeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(res.status === 404 || res.status === 200, 'DELETE non-existent employee handled safely', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'DELETE non-existent employee failed', err.message);
  }


  // --- 4. DATA VALIDATION EDGE CASES ---
  console.log('\n--- 4. DATA VALIDATION EDGE CASES ---');

  // 4.1 Create employee missing required fields
  try {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Incomplete User'
      })
    });
    assert(res.status >= 400, 'Creating employee without required fields fails validation (400/500)', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Validation test failed', err.message);
  }

  // 4.2 Create task with invalid priority or missing title
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'Missing title task'
      })
    });
    assert(res.status >= 400, 'Creating task without title fails validation', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Task validation failed', err.message);
  }


  // --- 5. ATTENDANCE SCAN & QR EDGE CASES ---
  console.log('\n--- 5. ATTENDANCE EDGE CASES ---');

  // 5.1 Scanning with non-existent employee QR token
  try {
    const res = await fetch(`${API_BASE}/attendance/scan`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employeeId: 'NON_EXISTENT_EMP_999',
        scanTime: new Date().toISOString()
      })
    });
    assert(res.status === 404 || res.status === 400, 'Scan with invalid employee ID rejected', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Attendance scan invalid ID test failed', err.message);
  }

  // 5.2 Manual attendance record creation with invalid data
  try {
    const res = await fetch(`${API_BASE}/attendance/manual`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employeeId: '507f1f77bcf86cd799439011',
        date: 'invalid-date',
        status: 'INVALID_STATUS'
      })
    });
    assert(res.status >= 400, 'Manual attendance with invalid status/date rejected', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'Manual attendance validation test failed', err.message);
  }


  console.log('\n====================================================');
  console.log(`📊 SUMMARY: ${passed} PASSED, ${failed} FAILED OUT OF ${passed + failed} EDGE CASE TESTS`);
  console.log('====================================================');
}

runEdgeCaseTests();
