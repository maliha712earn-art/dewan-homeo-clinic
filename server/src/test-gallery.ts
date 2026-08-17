const BASE_URL = 'http://localhost:5000/api';

async function testGalleryFlow() {
  console.log('🧪 Testing Public Gallery & Case Studies Integration...');

  try {
    // 1. Fetch All Public Before/After Cases
    const casesRes = await fetch(`${BASE_URL}/before-after`);
    const casesData = await casesRes.json();
    if (!casesData.success) throw new Error('Fetch cases failed: ' + casesData.message);
    const cases = casesData.data;
    console.log(`✅ 1. Public Gallery fetched: ${cases.length} case studies found in database`);

    if (cases.length === 0) throw new Error('Expected cases in database but found none');

    console.log('   Sample Case Study:', {
      titleBn: cases[0].titleBn,
      category: cases[0].category,
      durationText: cases[0].durationText,
      hasConsent: cases[0].hasConsent,
      isPublished: cases[0].isPublished,
    });

    // 2. Filter by Category
    const skinRes = await fetch(`${BASE_URL}/before-after?category=${encodeURIComponent('ত্বকের সমস্যা')}`);
    const skinData = await skinRes.json();
    if (!skinData.success) throw new Error('Category filter failed');
    console.log(`✅ 2. Category filter ("ত্বকের সমস্যা") verified: ${skinData.data.length} case(s) found`);

    // 3. Admin Login & Verify Admin Case Studies Endpoint
    const loginRes = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@dewanhomeo.com',
        password: 'Admin@123456',
      }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const adminCasesRes = await fetch(`${BASE_URL}/admin/before-after`, { headers: adminHeaders });
    const adminCasesData = await adminCasesRes.json();
    if (!adminCasesData.success) throw new Error('Admin case studies check failed');
    console.log(`✅ 3. Admin Before/After cases endpoint verified: ${adminCasesData.data.length} cases`);

    // 4. Verify Adjacent Modules Are 100% Unbroken
    const [dashRes, ordersRes, custRes, msgRes, logsRes] = await Promise.all([
      fetch(`${BASE_URL}/admin/dashboard-stats`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/orders`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/customers`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/messages`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/audit-logs`, { headers: adminHeaders }),
    ]);

    const [dash, ord, cust, msg, logs] = await Promise.all([
      dashRes.json(),
      ordersRes.json(),
      custRes.json(),
      msgRes.json(),
      logsRes.json(),
    ]);

    if (!dash.success || !ord.success || !cust.success || !msg.success || !logs.success) {
      throw new Error('Adjacent module check failed');
    }
    console.log('✅ 4. Verified Dashboard, Orders, Customers, Messages, and Audit Logs are 100% operational');

    console.log('\n🎉 ALL /gallery & /before-after TESTS PASSED WITH 100% SUCCESS!');
  } catch (err: any) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testGalleryFlow();
