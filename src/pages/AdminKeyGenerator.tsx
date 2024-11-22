import { useState } from 'react';
import { Shield, Key, Copy, Check } from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import toast from 'react-hot-toast';

export default function AdminKeyGenerator() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { barberKeys, generateNewBarberKey } = useAdminStore();

  const handleGenerateKey = () => {
    const newKey = generateNewBarkerKey();
    toast.success('Nueva clave de barbero generada');
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success('Clave copiada al portapapeles');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Shield className="w-8 h-8 text-primary-600" />
          <h1 className="font-serif text-3xl">Generador de Claves</h1>
        </div>
        <button
          onClick={handleGenerateKey}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Key className="w-4 h-4" />
          <span>Generar Nueva Clave</span>
        </button>
      </div>

      <div className="card">
        <h2 className="font-serif text-xl mb-4">Claves de Barbero</h2>
        <div className="space-y-4">
          {barberKeys.length === 0 ? (
            <p className="text-primary-600">No hay claves generadas</p>
          ) : (
            <div className="divide-y divide-primary-100">
              {barberKeys.map((key) => (
                <div
                  key={key.key}
                  className="py-4 flex items-center justify-between"
                >
                  <div>
                    <code className="bg-primary-50 px-2 py-1 rounded">
                      {key.key}
                    </code>
                    <span
                      className={`ml-3 text-sm ${
                        key.used ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {key.used ? 'Utilizada' : 'Disponible'}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(key.key)}
                    className="btn btn-secondary"
                    disabled={key.used}
                  >
                    {copiedKey === key.key ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}