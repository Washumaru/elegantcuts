import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Edit2, Trash2, ExternalLink, RefreshCw, Info, Search } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { shopService } from '../../services/shopService';
import { appointmentService } from '../../services/appointmentService';
import { notificationService } from '../../services/notificationService';
import { Shop } from '../../types/shop';
import { Appointment } from '../../types/appointment';
import ShopCard from '../../components/shop/ShopCard';
import AppointmentEditModal from '../../components/appointments/AppointmentEditModal';
import toast from 'react-hot-toast';

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
}

function AppointmentDetailsModal({ appointment, onClose }: AppointmentDetailsModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Ajustar la fecha para la zona horaria local
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-soft-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-serif">Detalles de la Cita</h3>
          <button onClick={onClose} className="text-primary-600 hover:text-primary-800 smooth-transition">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass p-4 rounded-xl">
            <p className="text-sm text-primary-600 mb-1">ID de la Cita</p>
            <p className="font-medium font-mono bg-primary-50 px-3 py-1 rounded-lg text-sm">{appointment.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-4 rounded-xl">
              <p className="text-sm text-primary-600 mb-1">Local</p>
              <p className="font-medium">{appointment.shopName}</p>
            </div>

            <div className="glass p-4 rounded-xl">
              <p className="text-sm text-primary-600 mb-1">Estado</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                appointment.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : appointment.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {appointment.status}
              </span>
            </div>
          </div>

          <div className="glass p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-primary-600">Fecha y Hora</p>
                <p className="font-medium">
                  {formatDate(appointment.date)} - {appointment.time}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-primary-600">Tiempo Restante</p>
                <p className="font-medium">
                  {appointmentService.calculateTimeRemaining(appointment.date, appointment.time)}
                </p>
              </div>
            </div>
          </div>

          {appointment.barberId && (
            <div className="glass p-4 rounded-xl">
              <p className="text-sm text-primary-600 mb-1">Barbero Asignado</p>
              <p className="font-medium">{appointmentService.getBarberName(appointment.barberId)}</p>
            </div>
          )}

          <div className="glass p-4 rounded-xl">
            <p className="text-sm text-primary-600 mb-1">Creada el</p>
            <p className="font-medium">{new Date(appointment.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <button onClick={onClose} className="btn btn-primary w-full mt-8">
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const user = useAuthStore((state) => state.user);
  const [shops, setShops] = useState<Shop[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;
    const allShops = shopService.getShops().filter(shop => shop.isActive);
    setShops(allShops);
    loadAppointments();
  };

  const loadAppointments = () => {
    if (!user) return;
    const userAppointments = appointmentService.getClientAppointments(user.id);
    setAppointments(userAppointments.filter(apt => apt.status !== 'cancelled'));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Ajustar la fecha para la zona horaria local
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString();
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    if (!user) return;

    try {
      await appointmentService.updateAppointmentStatus(appointment.id, 'cancelled');
      
      if (appointment.barberId) {
        notificationService.createNotification({
          type: 'appointment_cancel',
          message: `El cliente ${user.name} ha cancelado su cita`,
          userId: appointment.barberId,
          appointmentId: appointment.id
        });
      }

      toast.success('Cita cancelada exitosamente');
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar la cita');
    }
  };

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="glass p-8 rounded-2xl mb-12 animate-fade-in">
        <h1 className="font-serif text-4xl mb-2">¡Bienvenido, {user?.name}!</h1>
        <p className="text-primary-600">Gestiona tus citas y descubre nuevos locales.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="glass p-6 rounded-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Calendar className="w-6 h-6 text-primary-600" />
                <h2 className="font-serif text-2xl">Próximas citas</h2>
              </div>
              <button
                onClick={loadAppointments}
                className="btn btn-secondary p-2"
                title="Actualizar citas"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="glass p-6 rounded-xl hover-lift"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif text-lg mb-2">{appointment.shopName}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-primary-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-primary-600">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time}</span>
                          </div>
                          {appointment.barberId && (
                            <div className="flex items-center space-x-2 text-primary-600">
                              <Info className="w-4 h-4" />
                              <span>Barbero: {appointmentService.getBarberName(appointment.barberId)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetailsModal(true);
                          }}
                          className="btn btn-secondary p-2"
                          title="Ver detalles"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowEditModal(true);
                          }}
                          className="btn btn-secondary p-2"
                          title="Editar cita"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appointment)}
                          className="btn btn-secondary p-2 text-red-500"
                          title="Cancelar cita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-primary-600">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes citas programadas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl h-fit animate-slide-up">
          <h2 className="font-serif text-2xl mb-6">Estadísticas</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-soft">
              <p className="text-primary-600 mb-1">Citas Activas</p>
              <p className="text-3xl font-serif">{appointments.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-soft">
              <p className="text-primary-600 mb-1">Próxima Cita</p>
              <p className="text-lg font-medium">
                {appointments[0] ? (
                  `${formatDate(appointments[0].date)} - ${appointments[0].time}`
                ) : (
                  'Sin citas programadas'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl">Barberías Disponibles</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar barberías..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} showAppointmentForm />
          ))}
          {filteredShops.length === 0 && (
            <div className="col-span-full text-center py-12 text-primary-600">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron barberías</p>
            </div>
          )}
        </div>
      </section>

      {showEditModal && selectedAppointment && (
        <AppointmentEditModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAppointment(null);
          }}
          onUpdate={loadAppointments}
        />
      )}

      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}