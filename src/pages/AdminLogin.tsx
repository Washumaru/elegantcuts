import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { verifyAdminKey, markAdminKeyAsUsed } from '../utils/adminKeys';

export default function AdminLogin() {
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isValid = await verifyAdminKey(adminKey);
      
      if (!isValid) {
        throw new Error('Clave de administrador inválida o ya utilizada');
      }

      // Mark the key as used and remove it
      const marked = await markAdminKeyAsUsed(adminKey);
      if (!marked) {
        throw new Error('La clave ya ha sido utilizada');
      }

      // Create admin user session
      const adminUser = {
        id: 'admin',
        name: 'Administrador',
        email: 'admin@system.local',
        role: 'admin' as const,
      };

      login(adminUser, adminKey);
      toast.success('¡Bienvenido, Administrador!');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
      setAdminKey('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h1 className="font-serif text-3xl text-primary-900">Acceso Administrativo</h1>
        <p className="text-primary-600 mt-2">Ingrese su clave de administrador para continuar</p>
      </div>

      <form onSubmit={handleAdminLogin} className="card space-y-6">
        <div>
          <label htmlFor="adminKey" className="block text-sm font-medium text-primary-700 mb-1">
            Clave de Administrador
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="adminKey"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="input flex-1"
              placeholder="ADM-XXXXXXXXXXXXXXXX"
              required
            />
            <Key className="w-6 h-6 text-primary-600" />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Verificando...' : 'Acceder como Administrador'}
        </button>
      </form>
    </div>
  );
}