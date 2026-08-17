import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const FloatingActions: React.FC = () => {
  const { settings } = useSettings();

  const phone = settings.phone || '01643184368';
  const whatsapp = settings.whatsapp || '01643184368';
  const whatsappUrl = `https://wa.me/88${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'আসসালামু আলাইকুম, দেওয়ান হোমিও ক্লিনিক থেকে পরামর্শ নিতে চাচ্ছি।'
  )}`;

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col gap-3">
      {/* WhatsApp Button */}
      {whatsapp && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="hidden sm:inline font-bold text-sm">হোয়াটসঅ্যাপ</span>
        </a>
      )}

      {/* Call Button */}
      <a
        href={`tel:${phone}`}
        className="flex items-center gap-2 bg-emerald-700 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        title="সরাসরি কল করুন"
      >
        <Phone className="w-6 h-6" />
        <span className="hidden sm:inline font-bold text-sm">📞 {phone}</span>
      </a>
    </div>
  );
};
