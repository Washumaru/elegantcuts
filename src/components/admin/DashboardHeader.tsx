import { Store, Settings } from 'lucide-react';

interface DashboardHeaderProps {
  onNavigate: (path: string) => void;
}

export default function DashboardHeader({ onNavigate }: DashboardHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8 rounded-2xl mb-8 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-serif text-4xl mb-2">Panel de Administración</h1>
            <p className="text-primary-100">Gestiona usuarios, locales y sistema</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('/elegantcuts/admin/shops')}
              className="btn bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center space-x-2 backdrop-blur-sm transition-all duration-200"
            >
              <Store className="w-4 h-4" />
              <span>Gestión de Locales</span>
            </button>
            <button
              onClick={() => onNavigate('/elegantcuts/admin')}
              className="btn bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center space-x-2 backdrop-blur-sm transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              <span>Panel Principal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}