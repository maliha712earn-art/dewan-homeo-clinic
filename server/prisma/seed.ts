import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for “দেওয়ান হোমিও ক্লিনিক” (Deowan Homeo Clinic)...');

  // 1. Create Default Admin
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@dewanhomeo.com' },
    update: {
      name: 'প্রধান অ্যাডমিন',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    create: {
      name: 'প্রধান অ্যাডমিন',
      email: 'admin@dewanhomeo.com',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Seed Dynamic Website Settings
  const defaultSettings = [
    { key: 'CLINIC_NAME', value: 'দেওয়ান হোমিও ক্লিনিক', category: 'CLINIC', description: 'ক্লিনিকের বাংলা নাম' },
    { key: 'CLINIC_NAME_EN', value: 'Deowan Homeo Clinic', category: 'CLINIC', description: 'Clinic Name in English' },
    { key: 'TAGLINE', value: 'বিশ্বস্ত পরামর্শ, যত্ন ও সেবায় আপনার পাশে', category: 'CLINIC', description: 'ক্লিনিকের মূল স্লোগান' },
    { key: 'PHONE', value: '01643184368', category: 'CONTACT', description: 'প্রধান হেল্পলাইন নম্বর' },
    { key: 'WHATSAPP', value: '01643184368', category: 'CONTACT', description: 'হোয়াটসঅ্যাপ নম্বর' },
    { key: 'EMAIL', value: 'info@dewanhomeo.com', category: 'CONTACT', description: 'ইমেইল ঠিকানা' },
    { key: 'PRIMARY_ADDRESS', value: 'চাঁদপুর জেলার কচুয়া থানা, গোলবাহার রোড।', category: 'CONTACT', description: 'প্রধান ঠিকানা' },
    { key: 'ADDITIONAL_ADDRESS', value: 'চাঁদপুর জেলার হাজীগঞ্জ থানার বিশ্বরোড থেকে রামগঞ্জ রোডের দিকে মনতলা বাজার এলাকার কাছাকাছি।', category: 'CONTACT', description: 'অতিরিক্ত অবস্থান বিবরণ' },
    { key: 'OPENING_HOURS', value: 'প্রতিদিন সকাল ৯:০০ টা - রাত ৮:০০ টা', category: 'CLINIC', description: 'সেবা প্রদানের সময়' },
    { key: 'HERO_TITLE', value: 'দেওয়ান হোমিও ক্লিনিকে স্বাগতম', category: 'HOMEPAGE', description: 'হোমপেজ প্রধান শিরোনাম' },
    { key: 'HERO_SUBTITLE', value: 'বিশ্বস্ত পরামর্শ, যত্ন ও সেবায় আপনার পাশে', category: 'HOMEPAGE', description: 'হোমপেজ সাব-শিরোনাম' },
    { key: 'HERO_DESCRIPTION', value: 'হোমিওপ্যাথিক চিকিৎসা ও স্বাস্থ্যসেবা সম্পর্কে পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন।', category: 'HOMEPAGE', description: 'হোমপেজ বিবরণ' },
    { key: 'ABOUT_TEXT', value: 'দেওয়ান হোমিও ক্লিনিক একটি হোমিওপ্যাথিক চিকিৎসা ও পরামর্শ কেন্দ্র। রোগীদের প্রয়োজন অনুযায়ী আন্তরিকভাবে পরামর্শ ও সেবা দেওয়াই আমাদের লক্ষ্য। আমরা রোগীর সমস্যা মনোযোগ দিয়ে শুনে প্রয়োজনীয় তথ্যের ভিত্তিতে ব্যক্তিকেন্দ্রিক পরামর্শ দেওয়ার চেষ্টা করি। পাশাপাশি স্বাস্থ্য ও ত্বকের বিভিন্ন সমস্যা সম্পর্কে সচেতনতামূলক তথ্য প্রদান করা হয়। আমাদের লক্ষ্য হলো রোগীদের সঙ্গে আন্তরিক যোগাযোগ বজায় রেখে দায়িত্বশীল ও সচেতনতামূলক স্বাস্থ্যসেবা প্রদান করা।', category: 'CLINIC', description: 'ক্লিনিক পরিচিতি ও লক্ষ্য' },
    { key: 'MEDICAL_DISCLAIMER', value: 'এই ওয়েবসাইটের তথ্য সাধারণ স্বাস্থ্য সচেতনতার উদ্দেশ্যে দেওয়া। অনলাইনে দেওয়া তথ্যের ভিত্তিতে চূড়ান্ত চিকিৎসা সিদ্ধান্ত নেওয়ার আগে প্রয়োজন অনুযায়ী যোগ্য চিকিৎসকের পরামর্শ নিন।', category: 'POLICY', description: 'চিকিৎসা সংক্রান্ত ডিসক্লেইমার' },
    { key: 'GUEST_CHECKOUT_ENABLED', value: 'true', category: 'GENERAL', description: 'গেস্ট চেকআউট সক্রিয় কিনা' },
    { key: 'CONSULTATION_ENABLED', value: 'true', category: 'GENERAL', description: 'অনলাইন পরামর্শ ফর্ম সক্রিয় কিনা' },
    { key: 'GOOGLE_MAPS_URL', value: '', category: 'CONTACT', description: 'গুগল ম্যাপ লিংক' },
    { key: 'GOOGLE_MAPS_EMBED_URL', value: '', category: 'CONTACT', description: 'গুগল ম্যাপ এমবেড কোড / URL' },
    { key: 'FACEBOOK_URL', value: 'https://facebook.com', category: 'GENERAL', description: 'ফেসবুক পেজ লিংক' },
    { key: 'YOUTUBE_URL', value: 'https://youtube.com', category: 'GENERAL', description: 'ইউটিউব চ্যানেল লিংক' },
  ];

  for (const s of defaultSettings) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description, category: s.category },
      create: s,
    });
  }
  console.log('✅ Website settings configured');

  // 3. Seed Services
  const servicesData = [
    {
      title: 'Homeopathic Consultation',
      titleBn: 'হোমিওপ্যাথিক পরামর্শ',
      slug: 'homeopathic-consultation',
      description: 'Detailed homeopathic consultation tailored to individual symptoms and medical history.',
      descriptionBn: 'আপনার স্বাস্থ্যসংক্রান্ত সমস্যা সম্পর্কে প্রয়োজনীয় তথ্য নিয়ে উপযুক্ত হোমিওপ্যাথিক পরামর্শ দেওয়ার চেষ্টা করা হয়।',
      price: 300,
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'Skin Problem Guidance',
      titleBn: 'ত্বকের সমস্যায় পরামর্শ',
      slug: 'skin-problem-guidance',
      description: 'Specialized awareness, consultation and follow-up support for various skin concerns.',
      descriptionBn: 'বিভিন্ন ধরনের ত্বকের সমস্যা সম্পর্কে সচেতনতা, পরামর্শ ও প্রয়োজনীয় follow-up সেবা।',
      price: 300,
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'Online Consultation',
      titleBn: 'অনলাইন পরামর্শ',
      slug: 'online-consultation',
      description: 'Remote consultation request service for patients unable to visit the clinic physically.',
      descriptionBn: 'ক্লিনিকে আসতে না পারলেও অনলাইনে যোগাযোগ করে পরামর্শের জন্য অনুরোধ পাঠাতে পারবেন।',
      price: 200,
      sortOrder: 3,
      isActive: true,
    },
    {
      title: 'Follow-up Care Service',
      titleBn: 'Follow-up সেবা',
      slug: 'follow-up-care',
      description: 'Continuous monitoring and personalized regular follow-up after initial consultation.',
      descriptionBn: 'চিকিৎসা গ্রহণের পর প্রয়োজন অনুযায়ী নিয়মিত যোগাযোগ ও follow-up-এর ব্যবস্থা।',
      price: 0,
      sortOrder: 4,
      isActive: true,
    },
  ];

  for (const svc of servicesData) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: { titleBn: svc.titleBn, descriptionBn: svc.descriptionBn, price: svc.price, sortOrder: svc.sortOrder },
      create: svc,
    });
  }
  console.log('✅ Services created');

  // 4. Seed Product Categories
  const productCats = [
    { name: 'Homeo Care Remedies', nameBn: 'হোমিওপ্যাথিক যত্ন ও পরামর্শ কিট', slug: 'homeo-care' },
    { name: 'Skin Health & Topicals', nameBn: 'ত্বকের স্বাস্থ্য ও বাহ্যিক যত্ন', slug: 'skin-care' },
    { name: 'General Wellness', nameBn: 'সাধারণ স্বাস্থ্য ও পুষ্টি সহায়তা', slug: 'general-wellness' },
    { name: 'Hair & Scalp Care', nameBn: 'চুল ও মাথার ত্বকের যত্ন', slug: 'hair-care' },
  ];

  const createdProdCats: Record<string, string> = {};
  for (const pcat of productCats) {
    const rec = await prisma.productCategory.upsert({
      where: { slug: pcat.slug },
      update: { nameBn: pcat.nameBn },
      create: pcat,
    });
    createdProdCats[pcat.slug] = rec.id;
  }
  console.log('✅ Product categories created');

  // 5. Seed Products
  const productsData = [
    {
      name: 'Berberis Aquifolium External Skin Lotion',
      nameBn: 'বারবেরিস একুইফোলিয়াম স্কিন লোশন (বাহ্যিক যত্ন)',
      slug: 'berberis-aquifolium-skin-lotion',
      categoryId: createdProdCats['skin-care'],
      price: 350,
      discountPrice: 300,
      stock: 50,
      sku: 'DH-SKIN-001',
      brand: 'দেওয়ান হোমিও ক্লিনিক',
      weightSize: '100 ml',
      status: 'ACTIVE',
      isPublished: true,
      isFeatured: true,
      isSpecialOffer: true,
      isNew: true,
      description: 'Gentle topical lotion for acne spots, dark marks, and smoothing facial skin texture.',
      descriptionBn: 'মুখের কালচে দাগ, মেছতা ও ব্রণের দাগের বাহ্যিক পরিচর্যার জন্য উপযোগী প্রশান্তিদায়ক স্কিন লোশন। ত্বকের স্বাভাবিক আর্দ্রতা বজায় রাখে।',
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Calendula Antiseptic Herbal Cream',
      nameBn: 'ক্যালেন্ডুলা অ্যান্টিসেপটিক প্রাকৃতিক ক্রিম',
      slug: 'calendula-antiseptic-herbal-cream',
      categoryId: createdProdCats['skin-care'],
      price: 280,
      discountPrice: 240,
      stock: 60,
      sku: 'DH-SKIN-002',
      brand: 'দেওয়ান হোমিও ক্লিনিক',
      weightSize: '50 g',
      status: 'ACTIVE',
      isPublished: true,
      isFeatured: true,
      isSpecialOffer: false,
      isNew: true,
      description: 'Soothing herbal cream for dry skin irritation, mild cuts, and environmental skin protection.',
      descriptionBn: 'শুষ্ক ত্বক, হালকা ফাটা ও জ্বালাপোড়ায় ত্বকের সুরক্ষা দিতে বিশুদ্ধ ক্যালেন্ডুলা নির্যাস সমৃদ্ধ প্রাকৃতিক ক্রিম।',
      images: [
        'https://images.unsplash.com/photo-1608248597359-05a8f5b8ec55?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Arnica Hair Vitalizer Oil',
      nameBn: 'আর্নিকা হেয়ার ভাইটালাইজার তেল',
      slug: 'arnica-hair-vitalizer-oil',
      categoryId: createdProdCats['hair-care'],
      price: 450,
      discountPrice: 390,
      stock: 40,
      sku: 'DH-HAIR-003',
      brand: 'দেওয়ান হোমিও ক্লিনিক',
      weightSize: '200 ml',
      status: 'ACTIVE',
      isPublished: true,
      isFeatured: true,
      isSpecialOffer: true,
      isNew: false,
      description: 'Nourishing botanical hair oil enriched with Arnica and Jaborandi extracts to nourish the scalp.',
      descriptionBn: 'মাথার ত্বকের পুষ্টি ও খুশকি প্রতিরোধে আর্নিকা ও জ্যাবোরান্ডি নির্যাস সমৃদ্ধ বিশুদ্ধ হেয়ার তেল। চুল পড়া রোধে সহায়ক।',
      images: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Gentle Cleansing Skin Wash',
      nameBn: 'জেন্টল ক্লেনজিং স্কিন ওয়াশ',
      slug: 'gentle-cleansing-skin-wash',
      categoryId: createdProdCats['skin-care'],
      price: 320,
      discountPrice: 280,
      stock: 35,
      sku: 'DH-WASH-004',
      brand: 'দেওয়ান হোমিও ক্লিনিক',
      weightSize: '120 ml',
      status: 'ACTIVE',
      isPublished: true,
      isFeatured: false,
      isSpecialOffer: false,
      isNew: true,
      description: 'Mild non-irritating cleanser suitable for all skin types including sensitive skin.',
      descriptionBn: 'অতিরিক্ত কেমিক্যালমুক্ত মৃদু ক্লিনজার যা ত্বকের স্বাভাবিক তেল ও আর্দ্রতা রক্ষা করে প্রতিদিনের ধূলোবালি পরিষ্কার করে।',
      images: [
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Natural Immunity & Vitality Support Supplement',
      nameBn: 'ন্যাচারাল ইমিউনিটি ও ভাইটালিটি সাপ্লিমেন্ট',
      slug: 'natural-immunity-vitality-support',
      categoryId: createdProdCats['general-wellness'],
      price: 550,
      discountPrice: 480,
      stock: 30,
      sku: 'DH-WELL-005',
      brand: 'দেওয়ান হোমিও ক্লিনিক',
      weightSize: '450 ml',
      status: 'ACTIVE',
      isPublished: true,
      isFeatured: true,
      isSpecialOffer: false,
      isNew: false,
      description: 'General health tonic supporting natural vitality, appetite and wellness under consultation.',
      descriptionBn: 'শারীরিক দুর্বলতা ও রোগপ্রতিরোধ ক্ষমতা বাড়াতে নিয়মিত স্বাস্থ্যকর পুষ্টি সহায়ক সাধারণ টনিক।',
      images: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      ],
    },
  ];

  for (const prod of productsData) {
    const { images, ...pData } = prod;
    const existing = await prisma.product.findUnique({ where: { slug: pData.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...pData,
          images: {
            create: images.map((url, idx) => ({ url, isPrimary: idx === 0 })),
          },
        },
      });
    }
  }
  console.log('✅ Products created');

  // 6. Seed Article Categories & Health Articles
  const articleCategoriesData = [
    { name: 'Skin Care Guidelines', nameBn: 'ত্বকের যত্ন ও পরামর্শ', slug: 'skin-care-guide', description: 'ত্বকের বিভিন্ন সমস্যা ও দৈনন্দিন যত্ন সংক্রান্ত তথ্য।' },
    { name: 'Homeopathy Awareness', nameBn: 'হোমিওপ্যাথি সচেতনতা', slug: 'homeopathy-awareness', description: 'হোমিওপ্যাথিক চিকিৎসা পদ্ধতির মৌলিক ধারণা ও সচেতনতা।' },
    { name: 'General Health', nameBn: 'দৈনন্দিন স্বাস্থ্য সচেতনতা', slug: 'general-health', description: 'সুস্থ জীবনযাপন ও খাদ্যতালিকা বিষয়ক সচেতনতামূলক নিবন্ধ।' },
  ];

  const createdArticleCats: Record<string, string> = {};
  for (const cat of articleCategoriesData) {
    const record = await prisma.articleCategory.upsert({
      where: { slug: cat.slug },
      update: { nameBn: cat.nameBn, description: cat.description },
      create: cat,
    });
    createdArticleCats[cat.slug] = record.id;
  }

  const articlesData = [
    {
      title: 'Daily Routine for Healthy and Glowing Skin',
      titleBn: 'ত্বকের যত্নে দৈনন্দিন করণীয়',
      slug: 'daily-skincare-routine-bangla',
      categoryId: createdArticleCats['skin-care-guide'],
      author: 'দেওয়ান হোমিও ক্লিনিক টিম',
      tags: 'ত্বকের যত্ন, স্কিনকেয়ার, স্বাস্থ্য',
      seoTitle: 'ত্বকের যত্নে দৈনন্দিন করণীয় - দেওয়ান হোমিও ক্লিনিক',
      seoDescription: 'প্রতিদিনের সাধারণ কিছু নিয়ম মেনে কীভাবে ত্বক সুস্থ ও সতেজ রাখা যায় জেনে নিন।',
      excerpt: 'Simple daily steps to maintain radiant, hydrated skin naturally.',
      excerptBn: 'প্রতিদিনের সাধারণ কিছু নিয়ম মেনে চললে ত্বকের সজীবতা বজায় রাখা সম্ভব। জেনে নিন ক্লিনজিং, ময়েশ্চারাইজিং ও সুরক্ষার সহজ উপায়।',
      coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      content: 'Detailed Bengali article on skin care.',
      contentBn: `## ত্বকের যত্নে দৈনন্দিন কিছু জরুরি নিয়ম

ত্বক আমাদের শরীরের সবচেয়ে বড় অঙ্গ এবং এটি আমাদের শরীরকে বাইরের পরিবেশের ধুলোবালি ও জীবাণু থেকে রক্ষা করে। তাই ত্বকের সঠিক যত্ন নেওয়া একান্ত আবশ্যক।

### ১. মৃদু পানি দিয়ে মুখ ধোয়া
দিনে অন্তত দুইবার মৃদু ও কেমিক্যালমুক্ত ক্লিনজার দিয়ে মুখ পরিষ্কার করুন। অতিরিক্ত গরম পানি ব্যবহার করবেন না, কারণ এতে ত্বকের প্রাকৃতিক তেল শুকিয়ে যায়।

### ২. নিয়মিত আর্দ্রতা (Moisturization) বজায় রাখা
গোসলের পর বা মুখ ধোয়ার পর ত্বক ভেজা থাকতেই উপযুক্ত ময়েশ্চারাইজার ব্যবহার করুন। এটি ত্বকের ব্যারিয়ারকে শক্তিশালী রাখে।

### ৩. পর্যাপ্ত পানি পান ও সুষম খাবার
ত্বক ভালো রাখতে ভেতর থেকে পুষ্টি প্রয়োজন। প্রতিদিন অন্তত ২.৫ থেকে ৩ লিটার পানি পান করুন এবং শাকসবজি ও ফলমূল বেশি করে খান।

### ৪. ক্ষতিকর ক্রিম বর্জন
বাজারে চটকদার বিজ্ঞাপনে দ্রুত ফর্সাকারী যেসকল ক্ষতিকর স্টেরয়েড বা পারদযুক্ত ক্রিম বিক্রি হয়, তা ত্বকের মারাত্মক ক্ষতি করে। এগুলো সম্পূর্ণরূপে এড়িয়ে চলুন।

---
> **ডিসক্লেইমার**: এই নিবন্ধটি সাধারণ স্বাস্থ্য সচেতনতার উদ্দেশ্যে প্রকাশিত। কোনো নির্দিষ্ট জটিলতায় অভিজ্ঞ চিকিৎসকের পরামর্শ নিন।`,
    },
    {
      title: 'Acne Awareness and Prevention Tips',
      titleBn: 'ব্রণ সম্পর্কে সাধারণ সচেতনতা',
      slug: 'acne-awareness-tips',
      categoryId: createdArticleCats['skin-care-guide'],
      author: 'দেওয়ান হোমিও ক্লিনিক টিম',
      tags: 'ব্রণ, তৈলাক্ত ত্বক, পরামর্শ',
      seoTitle: 'ব্রণ সম্পর্কে সাধারণ সচেতনতা ও যত্ন - দেওয়ান হোমিও ক্লিনিক',
      seoDescription: 'ব্রণ কেন হয় এবং সঠিক নিয়মে কীভাবে ব্রণের যত্ন নেওয়া যায় জেনে নিন।',
      excerpt: 'Understanding acne triggers and gentle daily management techniques.',
      excerptBn: 'ব্রণ খোঁটাখুঁটি না করে কীভাবে বিজ্ঞানসম্মত ও মৃদু উপায়ে ত্বকের যত্ন নেবেন জেনে নিন।',
      coverImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
      content: 'Detailed Bengali article on acne awareness.',
      contentBn: `## ব্রণ ও ফুসকুড়ির কারণ ও যত্ন

লোমকূপ যখন অতিরিক্ত তেল ও মৃত কোষ দিয়ে বন্ধ হয়ে যায়, তখন সেখানে জীবাণুর সংক্রমণে ব্রণ বা ফুসকুড়ির সৃষ্টি হয়।

### যা করবেন:
* মুখ স্পর্শ করার আগে হাত ভালো করে ধুয়ে নিন।
* ব্যবহৃত তোয়ালে ও বালিশের কভার নিয়মিত পরিষ্কার রাখুন।
* তৈলাক্ত খাবার ও অতিরিক্ত মিষ্টি জাতীয় খাবার নিয়ন্ত্রণ করুন।

### যা কখনো করবেন না:
* হাত দিয়ে ব্রণ খোঁটাখুঁটি বা চাপ দিয়ে ফাটানো সম্পূর্ণ নিষেধ। এতে দাগ ও গর্ত স্থায়ী হতে পারে।
* অতিরিক্ত ঘষাঘষি করে মুখ ধোবেন না।

---
> **ডিসক্লেইমার**: ত্বকে অতিরিক্ত ব্রণের প্রদাহ থাকলে ব্যক্তিগত পরামর্শের জন্য আমাদের অনলাইন পরামর্শ ফর্মের মাধ্যমে যোগাযোগ করতে পারেন।`,
    },
    {
      title: 'Understanding White Patches on Skin',
      titleBn: 'ত্বকের সাদা দাগ সম্পর্কে জানুন',
      slug: 'understanding-white-patches-skin',
      categoryId: createdArticleCats['skin-care-guide'],
      author: 'দেওয়ান হোমিও ক্লিনিক টিম',
      tags: 'শ্বেতী, ত্বকের সমস্যা, সচেতনতা',
      seoTitle: 'ত্বকের সাদা দাগ ও সচেতনতা - দেওয়ান হোমিও ক্লিনিক',
      seoDescription: 'ত্বকে সাদা ছোপ বা পিগমেন্ট হ্রাসের কারণ ও সচেতনতা।',
      excerpt: 'Awareness, myths vs facts, and holistic support for skin pigmentation issues.',
      excerptBn: 'ত্বকে পিগমেন্ট বা রঞ্জক কোষের ঘাটতি কেন হয় এবং এটি কোনো ছোঁয়াচে রোগ নয়—সচেতনতামূলক তথ্য।',
      coverImage: 'https://images.unsplash.com/photo-1512290900672-1f02a0a0f8b8?w=800&auto=format&fit=crop&q=80',
      content: 'Detailed Bengali article on white patches.',
      contentBn: `## ত্বকের সাদা দাগ: সচেতনতা ও যত্ন

ত্বকে মেলানিন উৎপাদন কমে গেলে বা বন্ধ হয়ে গেলে সাদা বা হালকা রঙের ছোপ দেখা দিতে পারে।

### জেনে রাখা জরুরি:
1. **এটি ছোঁয়াচে নয়**: স্পর্শ, মেলামেশা বা একসাথে খাওয়াদাওয়ায় এটি ছড়ায় না।
2. **রোদে সুরক্ষার প্রয়োজন**: আক্রান্ত অংশে মেলানিন কম থাকায় সরাসরি তীব্র রোদ থেকে ত্বক রক্ষা করা আবশ্যক।
3. **মানসিক স্বস্তি**: অতিরিক্ত মানসিক দুশ্চিন্তা ত্বকের সমস্যার ওপর নেতিবাচক প্রভাব ফেলে। আত্মবিশ্বাসী ও চাপমুক্ত থাকা সুস্থতার প্রথম শর্ত।

হোমিওপ্যাথিতে প্রতিটি রোগীর সামগ্রিক শারীরিক ও মানসিক লক্ষণের ওপর ভিত্তি করে ব্যক্তিগত যত্ন ও পরামর্শ দেওয়া হয়।

---
> **ডিসক্লেইমার**: কোনো চিকিৎসা পরামর্শের বিকল্প নয়। সঠিক তথ্যের ভিত্তিতে বিশেষজ্ঞ চিকিৎসকের শরণাপন্ন হন।`,
    },
  ];

  for (const art of articlesData) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: { titleBn: art.titleBn, contentBn: art.contentBn, excerptBn: art.excerptBn },
      create: art,
    });
  }
  console.log('✅ Health articles created');

  // 7. Seed Before & After Showcase (Ethical & Anonymized)
  const casesData = [
    {
      title: 'Skin Texture & Spot Improvement Case',
      titleBn: 'মুখের কালচে দাগ ও ব্রণ পরবর্তী পরিচর্যার ফলাফল',
      descriptionBn: 'নিয়মিত পরামর্শ, সঠিক জীবনযাপন ও হোমিওপ্যাথিক যত্নে রোগীর ত্বকের স্বাভাবিক মসৃণতা পুনরুদ্ধার হয়েছে।',
      category: 'ত্বকের সমস্যা',
      beforeImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
      afterImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80',
      durationText: '৩ মাস',
      hasConsent: true,
      isPublished: true,
      sortOrder: 1,
    },
    {
      title: 'Scalp & Dandruff Care Result',
      titleBn: 'মাথার ত্বকের খুশকি ও শুষ্কতা নিয়ন্ত্রণ',
      descriptionBn: 'উপযুক্ত ভেষজ ও হোমিওপ্যাথিক পরামর্শ গ্রহণের মাধ্যমে রোগীর খুশকির সমস্যা উল্লেখযোগ্যভাবে প্রশমিত হয়েছে।',
      category: 'চুলের যত্ন',
      beforeImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
      afterImage: 'https://images.unsplash.com/photo-1608248597359-05a8f5b8ec55?w=600&auto=format&fit=crop&q=80',
      durationText: '২ মাস',
      hasConsent: true,
      isPublished: true,
      sortOrder: 2,
    },
  ];

  for (const c of casesData) {
    const exist = await prisma.beforeAfterCase.findFirst({ where: { titleBn: c.titleBn } });
    if (!exist) {
      await prisma.beforeAfterCase.create({ data: c });
    }
  }
  console.log('✅ Before/After cases created');

  // 8. Seed Delivery Settings
  const deliveryZones = [
    { areaName: 'Local / Chandpur Area', areaNameBn: 'চাঁদপুর ও স্থানীয় এলাকা', charge: 50, estimatedDays: '১-২ দিন', isDefault: true },
    { areaName: 'All Over Bangladesh', areaNameBn: 'সারাদেশে হোম ডেলিভারি', charge: 120, estimatedDays: '২-৪ দিন', isDefault: false },
  ];

  for (const d of deliveryZones) {
    const exist = await prisma.deliverySetting.findFirst({ where: { areaName: d.areaName } });
    if (!exist) {
      await prisma.deliverySetting.create({ data: d });
    }
  }
  // 9. Seed Sample Registered Patients/Customers
  const sampleUsers = [
    {
      name: 'মোঃ রফিকুল ইসলাম',
      phone: '01712345678',
      email: 'rafiqul@gmail.com',
      passwordHash: await bcrypt.hash('User@123456', 10),
      address: 'গোলবাহার রোড, কচুয়া',
      district: 'চাঁদপুর',
      upazila: 'কচুয়া',
    },
    {
      name: 'মোসাঃ নাজমুন নাহার',
      phone: '01812345678',
      email: 'nazmun@gmail.com',
      passwordHash: await bcrypt.hash('User@123456', 10),
      address: 'মনতলা বাজার এলাকা, হাজীগঞ্জ',
      district: 'চাঁদপুর',
      upazila: 'হাজীগঞ্জ',
    },
    {
      name: 'মোঃ শামীম হোসেন',
      phone: '01912345678',
      email: 'shamim@gmail.com',
      passwordHash: await bcrypt.hash('User@123456', 10),
      address: 'রামগঞ্জ রোড, বিশ্বরোড',
      district: 'চাঁদপুর',
      upazila: 'হাজীগঞ্জ',
    },
    {
      name: 'ফাতেমা আক্তার',
      phone: '01512345678',
      email: 'fatema@gmail.com',
      passwordHash: await bcrypt.hash('User@123456', 10),
      address: 'চাঁদপুর সদর রোড',
      district: 'চাঁদপুর',
      upazila: 'চাঁদপুর সদর',
    },
  ];

  for (const u of sampleUsers) {
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: { name: u.name, address: u.address, district: u.district, upazila: u.upazila },
      create: u,
    });
  }
  console.log('✅ Registered customer profiles created');

  console.log('🎉 Seeding finished successfully for দেওয়ান হোমিও ক্লিনিক!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
