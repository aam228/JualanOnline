import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductForm from './pages/AdminProductForm';
import Cart from './components/Cart';
import ProductCreatePage from './pages/admin/ProductCreatePage';
import CollectionsPage from './pages/CollectionsPage';
import AllProductsPage from './pages/AllProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import ContactPage from './pages/ContactPage';

function AppLayout({ isCartOpen, setIsCartOpen }: { isCartOpen: boolean; setIsCartOpen: (value: boolean) => void }) {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={`App ${isAuthRoute ? 'auth-screen' : ''}`}>
      {!isAuthRoute && <Header onCartClick={() => setIsCartOpen(true)} />}

      <div className={`app-layout ${isAuthRoute ? 'auth-layout' : ''}`}>
        {!isAuthRoute && <Sidebar />}

        <main className={`main-content ${isAuthRoute ? 'auth-main-content' : ''}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/products/:id" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/products/create" element={<AdminRoute><ProductCreatePage /></AdminRoute>} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/all" element={<AllProductsPage />} />
          </Routes>
        </main>
      </div>

      {!isAuthRoute && <MobileNav />}
      {!isAuthRoute && <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </div>
  );
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppLayout isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
