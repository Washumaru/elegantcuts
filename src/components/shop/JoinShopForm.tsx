import { useState } from 'react';
import { Store, ArrowLeft, Key } from 'lucide-react';

interface JoinShopFormProps {
  onSubmit: (code: string) => void;
  onBack: () => void;
}

export default function JoinShopForm({ onSubmit, onBack }: JoinShopFormProps) {
  const [joinCode, setJoinCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(joinCode);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-soft-xl p-8 border border-primary-100/10">
        <div className="text-center mb-8">
          <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="font-serif text-2xl mb-2">Unirse a un Local</h2>
          <p className="text-primary-600">
            Ingresa el código proporcionado por el dueño del local
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Código de Unión
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
              <input
                type="text"
                required
                className="input pl-10"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Ej: ABC-123456"
              />
            </div>
            <p className="mt-2 text-sm text-primary-500">
              El código debe ser proporcionado por el dueño del local
            </p>
          </div>

          <button type="submit" className="btn btn-primary w-full py-3">
            Unirse al Local
          </button>

          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary w-full py-3 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>
        </form>
      </div>
    </div>
  );
}