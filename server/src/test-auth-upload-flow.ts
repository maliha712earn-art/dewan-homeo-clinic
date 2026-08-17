import request from 'supertest';
import app from './app';
import prisma from './config/db';
import { bootstrapDatabase } from './utils/bootstrap.util';

async function testFullAdminFlow() {
  console.log('🧪 Starting End-to-End Admin Auth -> Upload -> Product Flow Test...');

  // Step 1: Bootstrap database
  await bootstrapDatabase();

  // Step 2: Test Admin Login
  const loginRes = await request(app)
    .post('/api/admin/login')
    .send({
      email: 'admin@dewanhomeo.com',
      password: 'Admin@123456',
    });

  console.log('1. Admin Login Response Status:', loginRes.status);
  if (loginRes.status !== 200 || !loginRes.body.data?.token) {
    console.error('❌ Admin login failed:', loginRes.body);
    process.exit(1);
  }
  const adminToken = loginRes.body.data.token;
  console.log('✅ Admin Token Acquired Successfully');

  // Step 3: Test Image Upload with Token
  const uploadRes = await request(app)
    .post('/api/upload/admin-image')
    .set('Authorization', `Bearer ${adminToken}`)
    .set('x-admin-token', adminToken)
    .attach('image', Buffer.from('fake-image-data-sample'), 'sample-homeo-bottle.jpg');

  console.log('2. Image Upload Response Status:', uploadRes.status);
  if (uploadRes.status !== 200 || !uploadRes.body.data?.url) {
    console.error('❌ Image upload failed:', uploadRes.body);
    process.exit(1);
  }
  const uploadedImageUrl = uploadRes.body.data.url;
  console.log('✅ Image Uploaded Successfully! Image URL:', uploadedImageUrl);

  // Step 4: Test Categories retrieval
  const catRes = await request(app).get('/api/products/categories');
  console.log('3. Categories Response Status:', catRes.status);
  if (catRes.status !== 200 || !catRes.body.data?.length) {
    console.error('❌ Categories fetch failed:', catRes.body);
    process.exit(1);
  }
  const firstCategoryId = catRes.body.data[0].id;
  console.log('✅ Category Found:', catRes.body.data[0].nameBn, '(ID:', firstCategoryId, ')');

  // Step 5: Test Product Creation with uploaded image & category
  const createProductRes = await request(app)
    .post('/api/admin/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Thuja Occidentalis Mother Tincture Q',
      nameBn: 'থুজা অক্সিডেন্টালিস মাদার টিংচার কিউ',
      price: 420,
      discountPrice: 380,
      stock: 25,
      sku: `DH-THUJA-${Date.now().toString().slice(-4)}`,
      brand: 'দেওয়ান হোমিও ক্লিনিক',
      weightSize: '30 ml',
      status: 'ACTIVE',
      isPublished: true,
      categoryId: firstCategoryId,
      images: [uploadedImageUrl],
    });

  console.log('4. Create Product Response Status:', createProductRes.status);
  if (createProductRes.status !== 201) {
    console.error('❌ Create product failed:', createProductRes.body);
    process.exit(1);
  }
  console.log('✅ Product Created with Uploaded Image successfully! Product ID:', createProductRes.body.data?.id);

  console.log('\n🎉 ALL 5 STEPS IN ADMIN AUTH & UPLOAD FLOW PASSED WITH 100% SUCCESS!\n');
  process.exit(0);
}

testFullAdminFlow().catch((err) => {
  console.error('❌ Test failed with unhandled error:', err);
  process.exit(1);
});
