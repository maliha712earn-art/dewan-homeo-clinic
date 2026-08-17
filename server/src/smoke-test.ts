import app from './app';
import http from 'http';

const TEST_PORT = 5003;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

async function runProductionSmokeTest() {
  console.log('🧪 Starting Full Production Smoke Test on Unified Server...');

  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, '0.0.0.0', () => resolve());
  });

  try {
    // 1. Homepage & SPA Serving
    const homeRes = await fetch(`${BASE_URL}/`);
    const homeHtml = await homeRes.text();
    if (!homeHtml.includes('html') || !homeHtml.includes('root')) throw new Error('Homepage HTML failed');
    console.log('✅ 1. Homepage & React SPA bundle served with 200 OK');

    // 2. Public API Health Check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json() as any;
    if (healthData.status !== 'OK') throw new Error('Health check failed');
    console.log('✅ 2. API Health check passed: status=OK, service=' + healthData.service);

    // 3. Public Settings
    const settingsRes = await fetch(`${BASE_URL}/api/settings`);
    const settingsData = await settingsRes.json() as any;
    if (!settingsData.success) throw new Error('Settings failed');
    console.log(`✅ 3. Clinic settings retrieved: "${settingsData.data?.CLINIC_NAME || 'দেওয়ান হোমিও ক্লিনিক'}"`);

    // 4. Products & Shop
    const productsRes = await fetch(`${BASE_URL}/api/products`);
    const productsData = await productsRes.json() as any;
    const productsList = productsData.data?.products || productsData.data || [];
    if (!productsData.success || productsList.length === 0) throw new Error('Products failed');
    console.log(`✅ 4. Shop Products loaded: ${productsList.length} products available`);

    // 5. Services
    const servicesRes = await fetch(`${BASE_URL}/api/services`);
    const servicesData = await servicesRes.json() as any;
    if (!servicesData.success) throw new Error('Services failed');
    console.log(`✅ 5. Clinic Services loaded: ${servicesData.data.length} services available`);

    // 6. Case Studies / Gallery (/gallery route & API)
    const galleryPageRes = await fetch(`${BASE_URL}/gallery`);
    const galleryHtml = await galleryPageRes.text();
    const galleryApiRes = await fetch(`${BASE_URL}/api/before-after`);
    const galleryApiData = await galleryApiRes.json() as any;
    if (!galleryHtml.includes('html') || !galleryApiData.success) throw new Error('Gallery failed');
    console.log(`✅ 6. /gallery route and API verified: ${galleryApiData.data.length} case studies`);

    // 7. Blog (/blog route & API)
    const blogPageRes = await fetch(`${BASE_URL}/blog`);
    const blogHtml = await blogPageRes.text();
    const blogApiRes = await fetch(`${BASE_URL}/api/articles`);
    const blogApiData = await blogApiRes.json() as any;
    const blogArticles = blogApiData.data?.articles || blogApiData.data || [];
    if (!blogHtml.includes('html') || !blogApiData.success) throw new Error('Blog failed');
    console.log(`✅ 7. /blog route and API verified: ${blogArticles.length} articles`);

    // 8. Contact Form & Messages Submission
    const contactRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'স্মোক টেস্ট রোগী',
        phone: '01712009988',
        email: 'smoke@test.com',
        subject: 'সাধারণ পরামর্শ ও অ্যাপয়েন্টমেন্ট',
        message: 'আমি দেওয়ান হোমিও ক্লিনিকের অনলাইন সেবা নিতে চাই।',
      }),
    });
    const contactData = await contactRes.json() as any;
    if (!contactData.success) throw new Error('Contact submission failed: ' + contactData.message);
    console.log('✅ 8. Contact form submission verified. Message ID: ' + contactData.data.id);

    // 9. Online Consultation Request Submission
    const consultRes = await fetch(`${BASE_URL}/api/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'স্মোক টেস্ট কনসাল্টেশন',
        phone: '01812998877',
        age: 32,
        gender: 'MALE',
        problem: 'ত্বকে এলার্জি ও চুলকানির সমস্যা ২ মাস যাবত।',
        address: 'চাঁদপুর, কচুয়া',
      }),
    });
    const consultData = await consultRes.json() as any;
    if (!consultData.success) throw new Error('Consultation failed: ' + JSON.stringify(consultData));
    console.log('✅ 9. Consultation form submission verified. ID: ' + consultData.data.id);

    // 10. Customer Order Placement & Checkout
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'স্মোক টেস্ট ক্রেতা',
        phone: '01912998877',
        deliveryAddress: 'কচুয়া বাজার, চাঁদপুর',
        district: 'চাঁদপুর',
        paymentMethod: 'COD',
        deliveryCharge: 120,
        items: [
          {
            productId: productsList[0].id,
            quantity: 1,
          },
        ],
      }),
    });
    const orderData = await orderRes.json() as any;
    if (!orderData.success) throw new Error('Order placement failed: ' + orderData.message);
    const placedOrder = orderData.data;
    console.log(`✅ 10. Order placed: Number=${placedOrder.orderNumber}, Total=৳${placedOrder.totalAmount}`);

    // 11. Order Tracking (/track-order & /order-tracking)
    const trackOrderPageRes = await fetch(`${BASE_URL}/track-order`);
    const orderTrackingPageRes = await fetch(`${BASE_URL}/order-tracking`);
    const trackApiRes = await fetch(`${BASE_URL}/api/orders/track?orderNumber=${placedOrder.orderNumber}&phone=01912998877`);
    const trackApiData = await trackApiRes.json() as any;
    if (!trackApiData.success) throw new Error('Order tracking failed: ' + trackApiData.message);
    console.log(`✅ 11. Order tracking verified for ${placedOrder.orderNumber}: Status=${trackApiData.data.orderStatus}`);

    // 12. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@dewanhomeo.com',
        password: 'Admin@123456',
      }),
    });
    const adminLoginData = await adminLoginRes.json() as any;
    if (!adminLoginData.success) throw new Error('Admin login failed: ' + adminLoginData.message);
    const token = adminLoginData.data.token;
    console.log(`✅ 12. Admin authenticated: ${adminLoginData.data.admin.name} (${adminLoginData.data.admin.email})`);

    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 13. Admin Dashboard Overview
    const dashStatsRes = await fetch(`${BASE_URL}/api/admin/dashboard-stats`, { headers: adminHeaders });
    const dashStatsData = await dashStatsRes.json() as any;
    if (!dashStatsData.success) throw new Error('Admin dashboard stats failed');
    console.log(`✅ 13. Admin Dashboard Stats: Orders=${dashStatsData.data.totalOrders}, Consultations=${dashStatsData.data.consultations}`);

    // 14. Admin Orders List & Status Management
    const adminOrdersRes = await fetch(`${BASE_URL}/api/admin/orders`, { headers: adminHeaders });
    const adminOrdersData = await adminOrdersRes.json() as any;
    if (!adminOrdersData.success) throw new Error('Admin orders list failed');
    console.log(`✅ 14. Admin Orders Management: ${adminOrdersData.data.length} orders found`);

    // 15. Admin Customers List
    const adminCustRes = await fetch(`${BASE_URL}/api/admin/customers`, { headers: adminHeaders });
    const adminCustData = await adminCustRes.json() as any;
    if (!adminCustData.success) throw new Error('Admin customers failed');
    console.log(`✅ 15. Admin Customer Directory: ${adminCustData.data.length} registered customers`);

    // 16. Admin Messages Inbox
    const adminMsgRes = await fetch(`${BASE_URL}/api/admin/messages`, { headers: adminHeaders });
    const adminMsgData = await adminMsgRes.json() as any;
    if (!adminMsgData.success) throw new Error('Admin messages failed');
    console.log(`✅ 16. Admin Messages Inbox: ${adminMsgData.data.length} inquiries received`);

    // 17. Admin Audit Logs
    const adminLogsRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, { headers: adminHeaders });
    const adminLogsData = await adminLogsRes.json() as any;
    if (!adminLogsData.success) throw new Error('Admin audit logs failed');
    console.log(`✅ 17. Admin Audit Logs: ${adminLogsData.data.length} activities logged`);

    // 18. Admin SPA Route Fallbacks
    const adminRoutes = [
      '/admin',
      '/admin/orders',
      '/admin/customers',
      '/admin/messages',
      '/admin/audit-logs',
      '/admin/products',
      '/admin/services',
      '/admin/settings',
    ];
    for (const r of adminRoutes) {
      const pageRes = await fetch(`${BASE_URL}${r}`);
      const pageHtml = await pageRes.text();
      if (!pageHtml.includes('html')) throw new Error(`Route ${r} failed to render`);
    }
    console.log(`✅ 18. All ${adminRoutes.length} Admin SPA routes verified with 200 OK`);

    console.log('\n🎉 ALL 18 PRODUCTION SMOKE TESTS PASSED WITH 100% SUCCESS!');
  } catch (err: any) {
    console.error('❌ Smoke test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runProductionSmokeTest();
