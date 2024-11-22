import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ClientDashboard from './dashboard/ClientDashboard';
import BarberDashboard from './dashboard/BarberDashboard';
import AdminDashboard from './dashboard/AdminDashboard';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <Routes>
      {user.role === 'client' && (
        <Route path="/*" element={<ClientDashboard />} />
      )}
      {user.role === 'barber' && (
        <Route path="/*" element={<BarberDashboard />} />
      )}
      {user.role === 'admin' && (
        <Route path="/*" element={<AdminDashboard />} />
      )}
    </Routes>
  );
}
