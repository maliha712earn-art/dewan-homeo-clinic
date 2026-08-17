import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { DeliverySetting } from '../types';

interface SettingsState {
  clinicName: string;
  clinicNameEn: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  primaryAddress: string;
  additionalAddress: string;
  openingHours: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  aboutText: string;
  medicalDisclaimer: string;
  guestCheckoutEnabled: boolean;
  consultationEnabled: boolean;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
}

const defaultSettingsState: SettingsState = {
  clinicName: 'দেওয়ান হোমিও ক্লিনিক',
  clinicNameEn: 'Deowan Homeo Clinic',
  tagline: 'বিশ্বস্ত পরামর্শ, যত্ন ও সেবায় আপনার পাশে',
  phone: '01643184368',
  whatsapp: '01643184368',
  email: 'info@dewanhomeo.com',
  primaryAddress: 'চাঁদপুর জেলার কচুয়া থানা, গোলবাহার রোড।',
  additionalAddress: 'চাঁদপুর জেলার হাজীগঞ্জ থানার বিশ্বরোড থেকে রামগঞ্জ রোডের দিকে মনতলা বাজার এলাকার কাছাকাছি।',
  openingHours: 'প্রতিদিন সকাল ৯:০০ টা - রাত ৮:০০ টা',
  heroTitle: 'দেওয়ান হোমিও ক্লিনিকে স্বাগতম',
  heroSubtitle: 'বিশ্বস্ত পরামর্শ, যত্ন ও সেবায় আপনার পাশে',
  heroDescription: 'হোমিওপ্যাথিক চিকিৎসা ও স্বাস্থ্যসেবা সম্পর্কে পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন।',
  aboutText: 'দেওয়ান হোমিও ক্লিনিক একটি হোমিওপ্যাথিক চিকিৎসা ও পরামর্শ কেন্দ্র। রোগীদের প্রয়োজন অনুযায়ী আন্তরিকভাবে পরামর্শ ও সেবা দেওয়াই আমাদের লক্ষ্য। আমরা রোগীর সমস্যা মনোযোগ দিয়ে শুনে প্রয়োজনীয় তথ্যের ভিত্তিতে ব্যক্তিকেন্দ্রিক পরামর্শ দেওয়ার চেষ্টা করি। পাশাপাশি স্বাস্থ্য ও ত্বকের বিভিন্ন সমস্যা সম্পর্কে সচেতনতামূলক তথ্য প্রদান করা হয়। আমাদের লক্ষ্য হলো রোগীদের সঙ্গে আন্তরিক যোগাযোগ বজায় রেখে দায়িত্বশীল ও সচেতনতামূলক স্বাস্থ্যসেবা প্রদান করা।',
  medicalDisclaimer: 'এই ওয়েবসাইটের তথ্য সাধারণ স্বাস্থ্য সচেতনতার উদ্দেশ্যে দেওয়া। অনলাইনে দেওয়া তথ্যের ভিত্তিতে চূড়ান্ত চিকিৎসা সিদ্ধান্ত নেওয়ার আগে প্রয়োজন অনুযায়ী যোগ্য চিকিৎসকের পরামর্শ নিন।',
  guestCheckoutEnabled: true,
  consultationEnabled: true,
  googleMapsUrl: '',
  googleMapsEmbedUrl: '',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
};

interface SettingsContextType {
  settings: SettingsState;
  deliverySettings: DeliverySetting[];
  loading: boolean;
  refreshSettings: () => Promise<void>;
  refetchSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettingsState);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySetting[]>([
    { id: '1', areaName: 'Local / Chandpur Area', areaNameBn: 'চাঁদপুর ও স্থানীয় এলাকা', charge: 50, estimatedDays: '১-২ দিন', isDefault: true },
    { id: '2', areaName: 'All Over Bangladesh', areaNameBn: 'সারাদেশে হোম ডেলিভারি', charge: 120, estimatedDays: '২-৪ দিন', isDefault: false },
  ]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success) {
        const raw = res.data.data.settings;
        setSettings({
          clinicName: raw.CLINIC_NAME || defaultSettingsState.clinicName,
          clinicNameEn: raw.CLINIC_NAME_EN || defaultSettingsState.clinicNameEn,
          tagline: raw.TAGLINE || defaultSettingsState.tagline,
          phone: raw.PHONE || defaultSettingsState.phone,
          whatsapp: raw.WHATSAPP || defaultSettingsState.whatsapp,
          email: raw.EMAIL || defaultSettingsState.email,
          primaryAddress: raw.PRIMARY_ADDRESS || defaultSettingsState.primaryAddress,
          additionalAddress: raw.ADDITIONAL_ADDRESS || defaultSettingsState.additionalAddress,
          openingHours: raw.OPENING_HOURS || defaultSettingsState.openingHours,
          heroTitle: raw.HERO_TITLE || defaultSettingsState.heroTitle,
          heroSubtitle: raw.HERO_SUBTITLE || defaultSettingsState.heroSubtitle,
          heroDescription: raw.HERO_DESCRIPTION || defaultSettingsState.heroDescription,
          aboutText: raw.ABOUT_TEXT || defaultSettingsState.aboutText,
          medicalDisclaimer: raw.MEDICAL_DISCLAIMER || defaultSettingsState.medicalDisclaimer,
          guestCheckoutEnabled: raw.GUEST_CHECKOUT_ENABLED !== 'false',
          consultationEnabled: raw.CONSULTATION_ENABLED !== 'false',
          googleMapsUrl: raw.GOOGLE_MAPS_URL || '',
          googleMapsEmbedUrl: raw.GOOGLE_MAPS_EMBED_URL || '',
          facebookUrl: raw.FACEBOOK_URL || defaultSettingsState.facebookUrl,
          youtubeUrl: raw.YOUTUBE_URL || defaultSettingsState.youtubeUrl,
        });

        if (res.data.data.deliverySettings?.length > 0) {
          setDeliverySettings(res.data.data.deliverySettings);
        }
      }
    } catch (err) {
      console.warn('Failed to load live settings, using verified fallbacks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, deliverySettings, loading, refreshSettings: fetchSettings, refetchSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
