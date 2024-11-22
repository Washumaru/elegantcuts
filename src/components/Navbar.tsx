import { Link, useNavigate } from 'react-router-dom';
import { Scissors, User, LogOut, Bell, Menu, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import NotificationCenter from './notifications/NotificationCenter';
import MessageCenter from './messages/MessageCenter';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/elegantcuts/login');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-primary-900 to-primary-800 text-white shadow-lg relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/elegantcuts" 
            className="flex items-center space-x-3 group transition-all duration-300"
          >
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
              <Scissors className="w-7 h-7 text-white transform group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <span className="font-serif text-2xl tracking-wide">
              Elegant Cuts
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-4">
                  <MessageCenter />
                  <NotificationCenter />
                </div>
                
                <div className="h-8 w-px bg-white/20" />
                
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/elegantcuts/dashboard" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-100 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/elegantcuts/login"
                  className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/elegantcuts/register"
                  className="px-6 py-2 rounded-lg bg-white text-primary-900 hover:bg-primary-50 transition-colors duration-200"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden absolute inset-x-0 top-full bg-primary-800 border-t border-white/10 transition-all duration-300 ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-around py-4 border-b border-white/10">
                  <MessageCenter />
                  <NotificationCenter />
                </div>
                <div className="space-y-3">
                  <Link
                    to="/elegantcuts/dashboard"
                    className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-100 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/elegantcuts/login"
                  className="block px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-center transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/elegantcuts/register"
                  className="block px-4 py-3 rounded-lg bg-white text-primary-900 hover:bg-primary-50 text-center transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}