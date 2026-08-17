export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  upazila?: string | null;
  createdAt: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'STAFF';
  isActive?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  description: string;
  descriptionBn?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  sku?: string | null;
  brand?: string | null;
  weightSize?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  isPublished: boolean;
  isFeatured: boolean;
  isSpecialOffer: boolean;
  isNew: boolean;
  categoryId: string;
  category?: ProductCategory;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  titleBn: string;
  slug: string;
  description: string;
  descriptionBn: string;
  imageUrl?: string | null;
  price?: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ConsultationImage {
  id: string;
  url: string;
}

export interface Consultation {
  id: string;
  name: string;
  phone: string;
  age?: number | null;
  gender?: string | null;
  address?: string | null;
  problem: string;
  duration?: string | null;
  previousTreatment?: string | null;
  notes?: string | null;
  status: 'NEW' | 'REVIEWED' | 'CONTACTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  adminNotes?: string | null;
  isPrivate: boolean;
  images?: ConsultationImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  image?: string | null;
  product?: Product;
}

export interface OrderStatusHistory {
  id: string;
  status: string;
  note?: string | null;
  changedBy: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  district?: string | null;
  upazila?: string | null;
  customerNote?: string | null;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  adminNotes?: string | null;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface BeforeAfterCase {
  id: string;
  title: string;
  titleBn: string;
  description?: string | null;
  descriptionBn?: string | null;
  category: string;
  beforeImage: string;
  afterImage: string;
  durationText?: string | null;
  hasConsent: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  description?: string | null;
}

export interface Article {
  id: string;
  title: string;
  titleBn: string;
  slug: string;
  content: string;
  contentBn: string;
  excerpt?: string | null;
  excerptBn?: string | null;
  coverImage?: string | null;
  author: string;
  tags?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isPublished: boolean;
  viewCount: number;
  categoryId: string;
  category?: ArticleCategory;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  subject?: string | null;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED';
  adminNotes?: string | null;
  createdAt: string;
}

export interface WebsiteSetting {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  category: string;
}

export interface DeliverySetting {
  id: string;
  areaName: string;
  areaNameBn: string;
  charge: number;
  estimatedDays: string;
  isDefault: boolean;
}

export interface DashboardStats {
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
  };
  customers: {
    total: number;
  };
  consultations: {
    total: number;
    new: number;
  };
  messages: {
    total: number;
    new: number;
  };
  products: {
    total: number;
  };
  services: {
    total: number;
  };
  recentOrders: Order[];
  recentConsultations: Consultation[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  upazila?: string | null;
  ordersCount?: number;
  totalOrders?: number;
  consultationsCount?: number;
  totalSpent?: number;
  status?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  targetType?: string | null;
  resource?: string | null;
  targetId?: string | null;
  resourceId?: string | null;
  details?: string | null;
  adminId?: string | null;
  adminEmail?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}
