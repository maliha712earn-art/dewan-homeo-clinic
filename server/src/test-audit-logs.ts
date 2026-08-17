const BASE_URL = 'http://localhost:5000/api';

async function testAuditLogsFlow() {
  console.log('🧪 Testing Security Audit Logs API & Admin Integration...');

  try {
    // 1. Admin Login (Triggers LOGIN audit log)
    const loginRes = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@dewanhomeo.com',
        password: 'Admin@123456',
      }),
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error('Admin login failed');
    const token = loginData.data.token;
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    console.log('✅ 1. Admin login authenticated successfully');

    // 2. Fetch Audit Logs
    const logsRes = await fetch(`${BASE_URL}/admin/audit-logs?page=1&limit=15`, {
      headers: adminHeaders,
    });
    const logsData = await logsRes.json();
    if (!logsData.success) throw new Error('Fetch audit logs failed: ' + logsData.message);
    const logs = logsData.data.logs;
    console.log(`✅ 2. Audit logs retrieved: ${logs.length} logs on page 1 (Total in DB: ${logsData.data.counts?.total || logsData.data.pagination?.total})`);

    if (logs.length === 0) throw new Error('Expected audit logs in DB but found none');

    console.log('   Latest Log Entry:', {
      action: logs[0].action,
      targetType: logs[0].targetType,
      adminEmail: logs[0].adminEmail || logs[0].admin?.email,
      details: logs[0].details,
      createdAt: logs[0].createdAt,
    });

    // 3. Filter Audit Logs by Action
    const actionRes = await fetch(`${BASE_URL}/admin/audit-logs?action=LOGIN`, {
      headers: adminHeaders,
    });
    const actionData = await actionRes.json();
    if (!actionData.success || actionData.data.logs.length === 0) {
      throw new Error('Action filter for LOGIN returned no records');
    }
    console.log(`✅ 3. Filter by Action (LOGIN) verified: ${actionData.data.logs.length} logs found`);

    // 4. Search Audit Logs by Keyword
    const searchRes = await fetch(`${BASE_URL}/admin/audit-logs?search=admin@dewanhomeo.com`, {
      headers: adminHeaders,
    });
    const searchData = await searchRes.json();
    if (!searchData.success || searchData.data.logs.length === 0) {
      throw new Error('Search by admin email returned no records');
    }
    console.log(`✅ 4. Search by keyword verified: ${searchData.data.logs.length} matching logs found`);

    // 5. Verify Adjacent Pages are Completely Unbroken (Dashboard, Customers, Messages, Orders)
    const [dashRes, custRes, msgRes, orderRes] = await Promise.all([
      fetch(`${BASE_URL}/admin/dashboard-stats`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/customers`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/messages`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/orders`, { headers: adminHeaders }),
    ]);

    const [dash, cust, msg, ord] = await Promise.all([
      dashRes.json(),
      custRes.json(),
      msgRes.json(),
      orderRes.json(),
    ]);

    if (!dash.success || !cust.success || !msg.success || !ord.success) {
      throw new Error('Adjacent page endpoint check failed');
    }
    console.log('✅ 5. Verified Dashboard, Customers, Messages, and Orders are 100% operational');

    console.log('\n🎉 ALL /admin/audit-logs TESTS PASSED WITH 100% SUCCESS!');
  } catch (err: any) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testAuditLogsFlow();
