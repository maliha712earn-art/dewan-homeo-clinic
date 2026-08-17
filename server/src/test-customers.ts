const BASE_URL = 'http://localhost:5000/api';

async function testCustomersFlow() {
  console.log('🧪 Testing Customers API & Admin Directory Integration...');

  try {
    // 1. Admin Login
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

    // 2. Fetch Customers List
    const custRes = await fetch(`${BASE_URL}/admin/customers?page=1&limit=10`, {
      headers: adminHeaders,
    });
    const custData = await custRes.json();
    if (!custData.success) throw new Error('Fetch customers failed: ' + custData.message);
    const customers = custData.data.customers;
    console.log(`✅ 2. Customers listed successfully: ${customers.length} customers found`);
    console.log('   Customer Counts:', custData.data.counts);
    console.log('   Sample Customer:', {
      name: customers[0]?.name,
      phone: customers[0]?.phone,
      district: customers[0]?.district,
      totalSpent: customers[0]?.totalSpent,
      ordersCount: customers[0]?.ordersCount,
    });

    if (customers.length === 0) throw new Error('No customers found in database!');

    // 3. Search Customer by Name or Phone
    const testCustomer = customers[0];
    const searchRes = await fetch(`${BASE_URL}/admin/customers?search=${encodeURIComponent(testCustomer.phone)}`, {
      headers: adminHeaders,
    });
    const searchData = await searchRes.json();
    if (!searchData.success || searchData.data.customers.length === 0) {
      throw new Error('Customer search by phone failed');
    }
    console.log(`✅ 3. Search verified: Found "${searchData.data.customers[0].name}" for phone query ${testCustomer.phone}`);

    // 4. Fetch Detailed Customer Profile with Orders & Consultations
    const detailRes = await fetch(`${BASE_URL}/admin/customers/${testCustomer.id}`, {
      headers: adminHeaders,
    });
    const detailData = await detailRes.json();
    if (!detailData.success || !detailData.data.customer) {
      throw new Error('Fetch customer detail failed');
    }
    console.log('✅ 4. Customer detail verified:', {
      name: detailData.data.customer.name,
      phone: detailData.data.customer.phone,
      ordersCount: detailData.data.orders?.length,
      consultationsCount: detailData.data.consultations?.length,
    });

    // 5. Verify Other Endpoints Are Unbroken (Dashboard, Orders, Products, Services, Messages)
    const [dashRes, ordersRes, prodRes, servRes, msgRes] = await Promise.all([
      fetch(`${BASE_URL}/admin/dashboard-stats`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/orders`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/products`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/services`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/messages`, { headers: adminHeaders }),
    ]);

    const [dash, orders, prods, servs, msgs] = await Promise.all([
      dashRes.json(),
      ordersRes.json(),
      prodRes.json(),
      servRes.json(),
      msgRes.json(),
    ]);

    if (!dash.success || !orders.success || !prods.success || !servs.success || !msgs.success) {
      throw new Error('One of the adjacent admin modules failed check!');
    }
    console.log('✅ 5. Verified Dashboard, Orders, Products, Services, and Messages are 100% operational');

    console.log('\n🎉 ALL /admin/customers CHECKS PASSED WITH 100% SUCCESS!');
  } catch (err: any) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testCustomersFlow();
