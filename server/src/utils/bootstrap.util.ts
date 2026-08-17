import { execSync } from 'child_process';
import path from 'path';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';

/**
 * Automatically bootstraps database defaults on production server startup.
 * 1. Syncs Prisma schema tables to PostgreSQL/Supabase automatically.
 * 2. Ensures the default super admin account exists with hashed credentials.
 * 3. Seeds core website settings and delivery zones.
 * 4. Seeds default homeopathy product categories.
 */
export async function bootstrapDatabase() {
  console.log('🌱 Starting automatic database bootstrap and synchronization...');

  // Step 1: Sync Database Schema Tables (Self-healing for fresh/reconnected databases)
  try {
    console.log('🔄 Verifying and syncing Prisma schema tables...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: path.resolve(__dirname, '../../'),
      stdio: 'pipe',
      env: { ...process.env },
    });
    console.log('✅ Database schema tables verified & synced.');
  } catch (err: any) {
    console.warn('⚠️ Schema push notice (continuing bootstrap):', err.message || err);
  }

  // Step 2: Ensure Default Admin User Exists & Has Up-to-Date Credentials
  try {
    const defaultEmail = 'admin@dewanhomeo.com';
    const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123456';
    const adminPasswordHash = await bcrypt.hash(defaultPassword, 10);

    const admin = await prisma.admin.upsert({
      where: { email: defaultEmail },
      update: {
        name: 'প্রধান অ্যাডমিন',
        passwordHash: adminPasswordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
      create: {
        name: 'প্রধান অ্যাডমিন',
        email: defaultEmail,
        passwordHash: adminPasswordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log(`🔒 Default Admin verified: ${admin.email} (Role: ${admin.role}, Active: ${admin.isActive})`);
  } catch (err: any) {
    console.error('❌ Failed to bootstrap admin user:', err.message || err);
  }

  // Step 3: Ensure Core Website Settings Exist
  try {
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
      { key: 'ABOUT_TEXT', value: 'দেওয়ান হোমিও ক্লিনিক একটি হোমিওপ্যাথিক চিকিৎসা ও পরামর্শ কেন্দ্র। রোগীদের প্রয়োজন অনুযায়ী আন্তরিকভাবে পরামর্শ ও সেবা দেওয়াই আমাদের লক্ষ্য।', category: 'CLINIC', description: 'ক্লিনিক পরিচিতি ও লক্ষ্য' },
      { key: 'MEDICAL_DISCLAIMER', value: 'এই ওয়েবসাইটের তথ্য সাধারণ স্বাস্থ্য সচেতনতার উদ্দেশ্যে দেওয়া। অনলাইনে দেওয়া তথ্যের ভিত্তিতে চূড়ান্ত চিকিৎসা সিদ্ধান্ত নেওয়ার আগে প্রয়োজন অনুযায়ী যোগ্য চিকিৎসকের পরামর্শ নিন।', category: 'POLICY', description: 'চিকিৎসা সংক্রান্ত ডিসক্লেইমার' },
      { key: 'GUEST_CHECKOUT_ENABLED', value: 'true', category: 'GENERAL', description: 'গেস্ট চেকআউট সক্রিয় কিনা' },
      { key: 'CONSULTATION_ENABLED', value: 'true', category: 'GENERAL', description: 'অনলাইন পরামর্শ ফর্ম সক্রিয় কিনা' },
    ];

    for (const s of defaultSettings) {
      await prisma.websiteSetting.upsert({
        where: { key: s.key },
        update: {},
        create: s,
      });
    }
  } catch (err: any) {
    console.warn('⚠️ Website settings bootstrap notice:', err.message || err);
  }

  // Step 4: Ensure Default Delivery Zones Exist
  try {
    const deliveryCount = await prisma.deliverySetting.count();
    if (deliveryCount === 0) {
      await prisma.deliverySetting.createMany({
        data: [
          {
            areaName: 'Inside Dhaka / Chandpur Local',
            areaNameBn: 'চাঁদপুর / ঢাকার ভিতরে',
            charge: 60,
            estimatedDays: '২-৩ দিন',
            isDefault: true,
          },
          {
            areaName: 'Outside Dhaka / Nationwide',
            areaNameBn: 'সারা বাংলাদেশ (কুরিয়ার)',
            charge: 120,
            estimatedDays: '৩-৫ দিন',
            isDefault: false,
          },
        ],
      });
    }
  } catch (err: any) {
    console.warn('⚠️ Delivery settings bootstrap notice:', err.message || err);
  }

  // Step 5: Ensure Default Homeopathy Product Categories Exist
  try {
    const defaultCategories = [
      { name: 'Skin Care', nameBn: 'ত্বকের যত্ন', slug: 'skin-care', description: 'ত্বকের যত্ন ও বাহ্যিক পরিচর্যা পণ্য' },
      { name: 'Mother Tincture', nameBn: 'মাদার টিংচার', slug: 'mother-tincture', description: 'বিশুদ্ধ হোমিওপ্যাথিক উদ্ভিজ্জ ও ভেষজ মাদার টিংচার (Q)' },
      { name: 'Biochemic', nameBn: 'বায়োকেমিক', slug: 'biochemic', description: '১২ টি প্রয়োজনীয় টিস্যু সল্ট ও বায়োকেমিক মেডিসিন' },
      { name: 'Homeopathic Medicine', nameBn: 'হোমিওপ্যাথিক মেডিসিন', slug: 'homeopathic-medicine', description: 'হোমিওপ্যাথিক ডিলিউশন ও কমপ্লিট কেয়ার মেডিসিন' },
      { name: 'External Medicine', nameBn: 'বাহ্যিক প্রয়োগের ওষুধ', slug: 'external-medicine', description: 'লোশন, মলম, তেল ও বাহ্যিক ব্যবহারের ওষুধ' },
      { name: 'Hair Care', nameBn: 'চুলের যত্ন', slug: 'hair-care', description: 'চুল পড়া রোধ ও মাথার ত্বকের পুষ্টি যত্ন' },
      { name: 'General', nameBn: 'সাধারণ', slug: 'general', description: 'সাধারণ স্বাস্থ্য ও ফিটনেস সহায়ক পণ্য' },
    ];

    for (const cat of defaultCategories) {
      await prisma.productCategory.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          nameBn: cat.nameBn,
          description: cat.description,
        },
        create: cat,
      });
    }
    console.log('🌿 Default Homeopathy categories initialized & verified.');
  } catch (err: any) {
    console.warn('⚠️ Categories bootstrap notice:', err.message || err);
  }

  console.log('✅ Automatic database bootstrap completed.');
}
