import { Routes, Route } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import AdminShopManagement from './pages/AdminShopManagement';
import { useAuthStore } from './stores/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/elegantcuts" element={<Home />} />
          <Route path="/elegantcuts/login" element={<Login />} />
          <Route path="/elegantcuts/register" element={<Register />} />
          <Route path="/elegantcuts/admin-login" element={<AdminLogin />} />
          {isAuthenticated && (
            <>
              <Route path="/elegantcuts/dashboard/*" element={<Dashboard />} />
              {user?.role === 'admin' && (
                <>
                  <Route path="/elegantcuts/admin" element={<AdminPanel />} />
                  <Route path="/elegantcuts/admin/shops" element={<AdminShopManagement />} />
                </>
              )}
            </>
          )}
        </Routes>
      </main>
      <footer className="bg-primary-900 text-primary-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Scissors className="w-6 h-6" />
            <span className="font-serif text-xl">Elegant Cuts</span>
          </div>
          <p className="text-center text-primary-200">
            © {new Date().getFullYear()} Elegant Cuts. Reservados todos los
            derechos.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;