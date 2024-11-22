import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Key, TrendingUp, UserCheck, Crown } from 'lucide-react';
import { generateBarberKey, getAllBarberKeys, getAllAdminKeys } from '../../utils/adminKeys';
import { localDB } from '../../services/localDatabase';
import UserManagement from '../../components/UserManagement';
import AppointmentSearch from '../../components/admin/AppointmentSearch';
import StatsCard from '../../components/admin/StatsCard';
import DashboardHeader from '../../components/admin/DashboardHeader';
import TabPanel from '../../components/admin/TabPanel';
import toast from 'react-hot-toast';

interface KeyData {
  key: string;
  createdAt: number;
  used: boolean;
  usedBy?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [barberKeys, setBarberKeys] = useState<KeyData[]>([]);
  const [adminKeys, setAdminKeys] = useState<KeyData[]>([]);
  const [showKeys, setShowKeys] = useState(false);
  const [stats, setStats] = useState(localDB.getUserStats());
  const [activeTab, setActiveTab] = useState<'users' | 'appointments'>('users');

  useEffect(() => {
    loadKeys();
    setStats(localDB.getUserStats());
  }, []);

  const loadKeys = async () => {
    try {
      const [aKeys, bKeys] = await Promise.all([
        getAllAdminKeys(),
        getAllBarberKeys()
      ]);
      setAdminKeys(aKeys);
      setBarberKeys(bKeys);
    } catch (error: any) {
      toast.error('Error al cargar las claves');
      console.error('Error loading keys:', error.message);
    }
  };

  const handleGenerateBarberKey = async () => {
    try {
      await generateBarberKey();
      await loadKeys();
      toast.success('Nueva clave de barbero generada');
    } catch (error: any) {
      toast.error(error.message || 'Error al generar la clave');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardHeader onNavigate={navigate} />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={Users}
          title="Total Usuarios"
          value={stats.total}
          subtitle="Usuarios en el sistema"
          color="primary"
          extra={
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-sm text-primary-600">
                {stats.active} activos / {stats.blocked} bloqueados
              </p>
            </div>
          }
        />

        <StatsCard
          icon={Key}
          title="Claves"
          value={barberKeys.filter(k => !k.used).length}
          subtitle="Claves disponibles"
          color="blue"
          action={{
            label: "Generar Clave",
            onClick: handleGenerateBarberKey
          }}
        />

        <StatsCard
          icon={UserCheck}
          title="Barberos"
          value={stats.barbers}
          subtitle="Profesionales registrados"
          color="green"
        />

        <StatsCard
          icon={Crown}
          title="Administradores"
          value={stats.admins}
          subtitle="Gestores del sistema"
          color="purple"
        />
      </div>

      <TabPanel activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'users' ? (
          <UserManagement />
        ) : (
          <AppointmentSearch />
        )}
      </TabPanel>
    </div>
  );
}