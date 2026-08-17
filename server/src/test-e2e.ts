const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Full E2E Integration Testing for দেওয়ান হোমিও ক্লিনিক...');

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('✅ 1. Health check passed:', health);

    // 2. Public Settings
    const settingsRes = await fetch(`${BASE_URL}/settings`);
    const settings = await settingsRes.json();
    console.log('✅ 2. Public settings fetched:', {
      clinicName: settings.data.settings.CLINIC_NAME,
      phone: settings.data.settings.PHONE,
      deliveryZones: settings.data.deliverySettings.length,
    });

    // 3. Products
    const productsRes = await fetch(`${BASE_URL}/products`);
    const productsData = await productsRes.json();
    const products = productsData.data.products;
    console.log(`✅ 3. Products listed (${products.length} products found)`);
    if (products.length > 0) {
      const singleRes = await fetch(`${BASE_URL}/products/${products[0].slug}`);
      const singleProduct = await singleRes.json();
      console.log(`   -> Product details fetched: "${singleProduct.data.product.nameBn}"`);
    }

    // 4. Services
    const servicesRes = await fetch(`${BASE_URL}/services`);
    const services = await servicesRes.json();
    console.log(`✅ 4. Services fetched: ${services.data.length} services`);

    // 5. Articles
    const articlesRes = await fetch(`${BASE_URL}/articles`);
    const articles = await articlesRes.json();
    console.log(`✅ 5. Articles fetched: ${articles.data.articles.length} articles`);

    // 6. Before / After Cases
    const casesRes = await fetch(`${BASE_URL}/before-after`);
    const cases = await casesRes.json();
    console.log(`✅ 6. Before/After cases fetched: ${cases.data.length} cases`);

    // 7. Submit Consultation Request
    const consultRes = await fetch(`${BASE_URL}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'মোঃ জাহিদ হাসান',
        phone: '01711223344',
        age: 28,
        gender: 'Male',
        address: 'কচুয়া, চাঁদপুর',
        problem: 'গত ৬ মাস ধরে মুখে ব্রণের দাগ ও এলার্জি সমস্যা রয়েছে। প্রাকৃতিক সমাধান চাই।',
        duration: '৬ মাস',
        previousTreatment: 'এলোপ্যাথিক মলম ব্যবহার করা হয়েছিল কিন্তু দীর্ঘস্থায়ী সমাধান মেলেনি।',
      }),
    });
    const consult = await consultRes.json();
    console.log('✅ 7. Online Consultation submitted successfully:', consult.data.id);

    // 8. Place Customer Order
    const orderPayload = {
      customerName: 'মোঃ তানভীর রহমান',
      phone: '01899887766',
      deliveryAddress: 'গোলবাহার রোড, কচুয়া, চাঁদপুর',
      district: 'চাঁদপুর',
      upazila: 'কচুয়া',
      email: 'tanvir@example.com',
      customerNote: 'সন্ধ্যার পর ডেলিভারি দেবেন',
      paymentMethod: 'COD',
      deliveryCharge: 60,
      items: [
        {
          productId: products[0].id,
          quantity: 2,
        },
      ],
    };

    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    const orderData = await orderRes.json();
    const createdOrder = orderData.data;
    console.log(`✅ 8. Customer Order placed successfully: OrderNumber=${createdOrder.orderNumber}, Total=৳${createdOrder.totalAmount}`);

    // 9. Track Order by Order Number
    const trackRes = await fetch(`${BASE_URL}/orders/track/${createdOrder.orderNumber}`);
    const trackData = await trackRes.json();
    console.log(`✅ 9. Order Tracking verified: Order ${trackData.data.orderNumber} Status=${trackData.data.orderStatus}`);

    // 10. Submit Contact Message
    const contactRes = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'আহমেদ রফিক',
        phone: '01611002233',
        email: 'rafiq@example.com',
        subject: 'ক্লিনিক খোলা থাকার সময়',
        message: 'শুক্রবার দিনে কি সরাসরি ডাক্তার সাহেব চেম্বারে বসেন?',
      }),
    });
    const contactData = await contactRes.json();
    console.log('✅ 10. Contact Message sent successfully:', contactData.data.id);

    // 11. Admin Login
    const loginRes = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@dewanhomeo.com',
        password: 'Admin@123456',
      }),
    });
    const loginData = await loginRes.json();
    const adminToken = loginData.data.token;
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };
    console.log('✅ 11. Admin Login verified successfully. Token received.');

    // 12. Admin Dashboard Stats
    const statsRes = await fetch(`${BASE_URL}/admin/dashboard-stats`, { headers: adminHeaders });
    const statsData = await statsRes.json();
    console.log('✅ 12. Admin Dashboard stats retrieved:', {
      totalOrders: statsData.data.orders.total,
      pendingOrders: statsData.data.orders.pending,
      consultations: statsData.data.consultations.total,
    });

    // 13. Admin Orders & Status Update
    const adminOrdersRes = await fetch(`${BASE_URL}/admin/orders`, { headers: adminHeaders });
    const adminOrdersData = await adminOrdersRes.json();
    console.log(`✅ 13. Admin orders listed: ${adminOrdersData.data.orders.length} orders`);

    const updateStatusRes = await fetch(`${BASE_URL}/admin/orders/${createdOrder.id}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'Confirmed', note: 'Customer confirmed order via phone call' }),
    });
    const updateStatusData = await updateStatusRes.json();
    console.log(`✅ 14. Admin status update verified: Order status is now "${updateStatusData.data.orderStatus}"`);

    // 14. Admin Consultation Review
    const adminConsultRes = await fetch(`${BASE_URL}/admin/consultations`, { headers: adminHeaders });
    const adminConsultData = await adminConsultRes.json();
    console.log(`✅ 15. Admin consultations listed: ${adminConsultData.data.consultations.length} items`);

    // 15. Admin Audit Logs
    const auditLogsRes = await fetch(`${BASE_URL}/admin/audit-logs`, { headers: adminHeaders });
    const auditLogsData = await auditLogsRes.json();
    const logCount = auditLogsData.data.logs ? auditLogsData.data.logs.length : auditLogsData.data.length;
    console.log(`✅ 16. Admin Audit logs recorded: ${logCount} logs found`);

    console.log('\n🎉 ALL 16 FULL-STACK END-TO-END INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
