import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Shield, Key, Scissors, Trash2, LayoutDashboard, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { generateAdminKey, generateBarberKey, getAllAdminKeys, getAllBarberKeys, deleteAdminKey, deleteBarberKey } from '../utils/adminKeys';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [adminKeys, setAdminKeys] = useState<Array<{
    key: string;
    createdAt: number;
    used: boolean;
  }>>([]);
  const [barberKeys, setBarberKeys] = useState<Array<{
    key: string;
    createdAt: number;
    used: boolean;
    usedBy?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const [aKeys, bKeys] = await Promise.all([
        getAllAdminKeys(),
        getAllBarberKeys()
      ]);
      setAdminKeys(aKeys);
      setBarberKeys(bKeys);
    } catch (error) {
      console.error('Error loading keys:', error);
      toast.error('Error al cargar las claves');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAdminKey = async () => {
    try {
      await generateAdminKey();
      await loadKeys();
      toast.success('Nueva clave de administrador generada');
    } catch (error: any) {
      toast.error(error.message || 'Error al generar la clave');
    }
  };

  const handleGenerateBarberKey = async () => {
    try {
      await generateBarberKey();
      await loadKeys();
      toast.success('Nueva clave de barbero generada');
    } catch (error) {
      toast.error('Error al generar la clave');
    }
  };

  const handleDeleteAdminKey = async (key: string) => {
    try {
      await deleteAdminKey(key);
      await loadKeys();
      toast.success('Clave de administrador eliminada');
    } catch (error) {
      toast.error('Error al eliminar la clave');
    }
  };

  const handleDeleteBarberKey = async (key: string) => {
    try {
      await deleteBarberKey(key);
      await loadKeys();
      toast.success('Clave de barbero eliminada');
    } catch (error) {
      toast.error('Error al eliminar la clave');
    }
  };

  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      toast.success('Clave copiada al portapapeles');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      toast.error('Error al copiar la clave');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-xl text-primary-600">
            No tienes permiso para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <RefreshCw className="w-12 h-12 text-primary-600" />
          </div>
          <p className="text-xl text-primary-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8 rounded-2xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-12 h-12" />
            <div>
              <h1 className="font-serif text-3xl mb-2">Panel de Administración</h1>
              <p className="text-primary-100">Gestión de claves y accesos del sistema</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/elegantcuts/dashboard')}
            className="btn bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center space-x-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Ir al Dashboard</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Admin Keys Section */}
        <div className="bg-white rounded-2xl shadow-soft-xl p-8 border border-primary-100/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Key className="w-8 h-8 text-primary-600" />
              <h2 className="font-serif text-2xl">Claves de Administrador</h2>
            </div>
            <button
              onClick={handleGenerateAdminKey}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>Generar Nueva</span>
            </button>
          </div>

          <div className="space-y-4">
            {adminKeys.length === 0 ? (
              <div className="text-center py-8 text-primary-500 bg-primary-50/50 rounded-xl">
                <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay claves de administrador disponibles</p>
              </div>
            ) : (
              adminKeys.map((key) => (
                <div
                  key={key.key}
                  className="bg-white p-6 rounded-xl border border-primary-100 hover:shadow-soft-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <code className="block bg-primary-50 px-4 py-2 rounded-lg text-sm font-mono">
                        {key.key}
                      </code>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        Disponible
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(key.key)}
                        className="btn btn-secondary p-2"
                        title="Copiar clave"
                      >
                        {copiedKey === key.key ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteAdminKey(key.key)}
                        className="btn btn-secondary p-2 text-red-500"
                        title="Eliminar clave"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Barber Keys Section */}
        <div className="bg-white rounded-2xl shadow-soft-xl p-8 border border-primary-100/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Scissors className="w-8 h-8 text-primary-600" />
              <h2 className="font-serif text-2xl">Claves de Barbero</h2>
            </div>
            <button
              onClick={handleGenerateBarberKey}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>Generar Nueva</span>
            </button>
          </div>

          <div className="space-y-4">
            {barberKeys.length === 0 ? (
              <div className="text-center py-8 text-primary-500 bg-primary-50/50 rounded-xl">
                <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay claves de barbero generadas</p>
              </div>
            ) : (
              barberKeys.map((key) => (
                <div
                  key={key.key}
                  className="bg-white p-6 rounded-xl border border-primary-100 hover:shadow-soft-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <code className="block bg-primary-50 px-4 py-2 rounded-lg text-sm font-mono">
                        {key.key}
                      </code>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${
                          key.used
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {key.used ? `Utilizada por ${key.usedBy}` : 'Disponible'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(key.key)}
                        className="btn btn-secondary p-2"
                        disabled={key.used}
                        title="Copiar clave"
                      >
                        {copiedKey === key.key ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteBarberKey(key.key)}
                        className="btn btn-secondary p-2 text-red-500"
                        title="Eliminar clave"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}