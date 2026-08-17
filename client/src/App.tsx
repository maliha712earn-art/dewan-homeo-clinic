import React, { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';

// Common Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { AdminLayout } from './components/AdminLayout';

// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Consultation } from './pages/Consultation';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { TrackOrder } from './pages/TrackOrder';
import { BeforeAfter } from './pages/BeforeAfter';
import { Gallery } from './pages/Gallery';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Contact } from './pages/Contact';
import { LoginRegister } from './pages/LoginRegister';
import { Account } from './pages/Account';
import { NotFound } from './pages/NotFound';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminConsultations } from './pages/admin/AdminConsultations';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminBeforeAfter } from './pages/admin/AdminBeforeAfter';
import { AdminBlog } from './pages/admin/AdminBlog';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Scroll to top on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Admin Route Wrapper
const ProtectedAdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, loading } = useAdminAuth();
  if (loading) return null;
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

// Public Layout Wrapper
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <SettingsProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  {/* Public Customer Routes */}
                  <Route
                    path="/"
                    element={
                      <PublicLayout>
                        <Home />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <PublicLayout>
                        <About />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/services"
                    element={
                      <PublicLayout>
                        <Services />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/consultation"
                    element={
                      <PublicLayout>
                        <Consultation />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/shop"
                    element={
                      <PublicLayout>
                        <Shop />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/product/:slug"
                    element={
                      <PublicLayout>
                        <ProductDetail />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <PublicLayout>
                        <Cart />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <PublicLayout>
                        <Checkout />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/order-confirmation/:orderNumber"
                    element={
                      <PublicLayout>
                        <OrderConfirmation />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/track-order"
                    element={
                      <PublicLayout>
                        <TrackOrder />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/order-tracking"
                    element={
                      <PublicLayout>
                        <TrackOrder />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/gallery"
                    element={
                      <PublicLayout>
                        <Gallery />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/before-after"
                    element={
                      <PublicLayout>
                        <Gallery />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/blog"
                    element={
                      <PublicLayout>
                        <Blog />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/blog/:slug"
                    element={
                      <PublicLayout>
                        <BlogDetail />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/contact"
                    element={
                      <PublicLayout>
                        <Contact />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <PublicLayout>
                        <LoginRegister />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <PublicLayout>
                        <Account />
                      </PublicLayout>
                    }
                  />

                  {/* Admin Auth Route */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Admin Protected Dashboard Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedAdminRoute>
                        <AdminDashboard />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedAdminRoute>
                        <AdminOrders />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/consultations"
                    element={
                      <ProtectedAdminRoute>
                        <AdminConsultations />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedAdminRoute>
                        <AdminProducts />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/services"
                    element={
                      <ProtectedAdminRoute>
                        <AdminServices />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/before-after"
                    element={
                      <ProtectedAdminRoute>
                        <AdminBeforeAfter />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/blog"
                    element={
                      <ProtectedAdminRoute>
                        <AdminBlog />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/customers"
                    element={
                      <ProtectedAdminRoute>
                        <AdminCustomers />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/messages"
                    element={
                      <ProtectedAdminRoute>
                        <AdminMessages />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedAdminRoute>
                        <AdminSettings />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedAdminRoute>
                        <AdminUsers />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/audit-logs"
                    element={
                      <ProtectedAdminRoute>
                        <AdminAuditLogs />
                      </ProtectedAdminRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route
                    path="*"
                    element={
                      <PublicLayout>
                        <NotFound />
                      </PublicLayout>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </SettingsProvider>
    </ToastProvider>
  );
};
