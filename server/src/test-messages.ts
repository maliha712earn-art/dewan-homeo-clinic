const BASE_URL = 'http://localhost:5000/api';

async function testMessagesFlow() {
  console.log('🧪 Testing Complete Contact Messages Flow & Admin Integration...');

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
    if (!loginData.success) throw new Error('Admin login failed: ' + loginData.message);
    const token = loginData.data.token;
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    console.log('✅ 1. Admin login authenticated successfully');

    // 2. Customer Submits Contact Message
    const testMsgPayload = {
      name: 'মোঃ সাইদুল ইসলাম',
      phone: '01799887766',
      email: 'saidul@test.com',
      subject: 'ব্রণের চিকিৎসার খরচ ও সময়কাল',
      message: 'আসসালামু আলাইকুম, আমি কচুয়া উপজেলার বাসিন্দা। আমার মুখে দীর্ঘদিন ধরে ব্রণের সমস্যা রয়েছে। চিকিৎসার খরচ এবং কতদিন ওষুধ সেবন করতে হতে পারে জানালে উপকৃত হতাম।',
    };

    const submitRes = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMsgPayload),
    });
    const submitData = await submitRes.json();
    if (!submitData.success) throw new Error('Customer message submission failed: ' + submitData.message);
    const createdMsgId = submitData.data.id;
    console.log('✅ 2. Public contact form message submitted & saved to DB:', createdMsgId);

    // 3. Admin Fetches All Messages
    const listRes = await fetch(`${BASE_URL}/admin/messages?page=1&limit=10`, {
      headers: adminHeaders,
    });
    const listData = await listRes.json();
    if (!listData.success) throw new Error('Fetch messages failed: ' + listData.message);
    const messages = listData.data.messages;
    console.log(`✅ 3. Admin fetched messages: ${messages.length} messages found on page 1`);
    console.log('   Counts:', listData.data.counts);

    const createdInList = messages.find((m: any) => m.id === createdMsgId);
    if (!createdInList) throw new Error('Created message not found in admin list!');
    console.log(`   Found newly created message from "${createdInList.name}" with status: "${createdInList.status}"`);

    // 4. Admin Filters by UNREAD
    const unreadRes = await fetch(`${BASE_URL}/admin/messages?status=UNREAD`, {
      headers: adminHeaders,
    });
    const unreadData = await unreadRes.json();
    if (!unreadData.success) throw new Error('Unread filter failed');
    console.log(`✅ 4. Filter by UNREAD verified: ${unreadData.data.messages.length} unread messages returned`);

    // 5. Admin Search by Phone
    const searchRes = await fetch(`${BASE_URL}/admin/messages?search=01799887766`, {
      headers: adminHeaders,
    });
    const searchData = await searchRes.json();
    if (!searchData.success || searchData.data.messages.length === 0) {
      throw new Error('Search by phone failed');
    }
    console.log(`✅ 5. Search by Phone verified: Found message for "${searchData.data.messages[0].name}"`);

    // 6. Admin Marks Message as READ and Saves Admin Notes
    const updateRes = await fetch(`${BASE_URL}/admin/messages/${createdMsgId}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        status: 'READ',
        adminNotes: 'রোগীর সাথে ফোনে কথা হয়েছে, আগামী রবিবার গোলবাহার চেম্বারে দেখা করবেন।',
      }),
    });
    const updateData = await updateRes.json();
    if (!updateData.success || updateData.data.status !== 'READ') {
      throw new Error('Mark as READ failed');
    }
    console.log('✅ 6. Admin mark as READ & notes saved verified:', updateData.data.adminNotes);

    // 7. Admin Toggles Status Back to NEW (Unread)
    const toggleRes = await fetch(`${BASE_URL}/admin/messages/${createdMsgId}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'NEW' }),
    });
    const toggleData = await toggleRes.json();
    if (!toggleData.success || toggleData.data.status !== 'NEW') {
      throw new Error('Toggle to UNREAD failed');
    }
    console.log('✅ 7. Admin toggle back to UNREAD verified: status is', toggleData.data.status);

    // 8. Admin Deletes Message
    const deleteRes = await fetch(`${BASE_URL}/admin/messages/${createdMsgId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    const deleteData = await deleteRes.json();
    if (!deleteData.success) throw new Error('Delete message failed');
    console.log('✅ 8. Admin delete message verified successfully');

    // 9. Verify Other Admin Pages Are Not Broken (Dashboard, Orders, Customers)
    const [dashRes, ordersRes, custRes] = await Promise.all([
      fetch(`${BASE_URL}/admin/dashboard-stats`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/orders`, { headers: adminHeaders }),
      fetch(`${BASE_URL}/admin/customers`, { headers: adminHeaders }),
    ]);
    const [dashData, ordersData, custData] = await Promise.all([
      dashRes.json(),
      ordersRes.json(),
      custRes.json(),
    ]);

    if (!dashData.success || !ordersData.success || !custData.success) {
      throw new Error('Dashboard, Orders, or Customers endpoint check failed');
    }
    console.log('✅ 9. Verified Dashboard, Orders, and Customers pages are completely intact and working');

    console.log('\n🎉 ALL /admin/messages TESTS PASSED WITH 100% SUCCESS!');
  } catch (err: any) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testMessagesFlow();
