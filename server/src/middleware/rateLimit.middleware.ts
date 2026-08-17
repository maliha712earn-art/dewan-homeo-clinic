import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  message: { success: false, message: 'অতিরিক্ত অনুরোধের কারণে সাময়িক বিরতি। ১৫ মিনিট পর আবার চেষ্টা করুন।' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const consultationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: { success: false, message: 'আপনি খুব কম সময়ে একাধিক পরামর্শ অনুরোধ পাঠিয়েছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const contactLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10,
  message: { success: false, message: 'মেসেজ প্রেরণের সীমা অতিক্রম করেছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
  standardHeaders: true,
  legacyHeaders: false,
});
