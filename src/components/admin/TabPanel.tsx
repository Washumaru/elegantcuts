import { Users, Search } from 'lucide-react';

interface TabPanelProps {
  activeTab: 'users' | 'appointments';
  onTabChange: (tab: 'users' | 'appointments') => void;
  children: React.ReactNode;
}

export default function TabPanel({ activeTab, onTabChange, children }: TabPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-soft-xl overflow-hidden border border-primary-100/10">
      <div className="border-b border-primary-100">
        <div className="flex p-4 space-x-4">
          <button
            className={`px-6 py-3 font-medium text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'users'
                ? 'bg-primary-100 text-primary-800'
                : 'text-primary-600 hover:bg-primary-50'
            }`}
            onClick={() => onTabChange('users')}
          >
            <Users className="w-4 h-4" />
            <span>Gestión de Usuarios</span>
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'appointments'
                ? 'bg-primary-100 text-primary-800'
                : 'text-primary-600 hover:bg-primary-50'
            }`}
            onClick={() => onTabChange('appointments')}
          >
            <Search className="w-4 h-4" />
            <span>Buscar Citas</span>
          </button>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}