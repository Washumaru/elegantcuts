import { useState } from 'react';
import { Search, Calendar, Store, User, MapPin, Phone, Clock } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { shopService } from '../../services/shopService';
import { Appointment } from '../../types/appointment';
import { Shop } from '../../types/shop';
import toast from 'react-hot-toast';

export default function AppointmentSearch() {
  const [appointmentId, setAppointmentId] = useState('');
  const [searchResult, setSearchResult] = useState<{
    appointment: Appointment;
    shop: Shop;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId.trim()) {
      toast.error('Por favor ingresa un ID de cita');
      return;
    }

    setIsLoading(true);
    try {
      const appointment = appointmentService.getAppointmentById(appointmentId);
      if (!appointment) {
        throw new Error('Cita no encontrada');
      }

      const shop = shopService.getShopById(appointment.shopId);
      if (!shop) {
        throw new Error('Local no encontrado');
      }

      setSearchResult({ appointment, shop });
    } catch (error: any) {
      toast.error(error.message || 'Error al buscar la cita');
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar cita por ID (ej: APT-XXXXXXXX)"
            className="input pl-10 w-full"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {searchResult && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Información de la Cita */}
          <div className="card">
            <h3 className="font-serif text-xl mb-6 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <span>Información de la Cita</span>
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-primary-600">ID de la Cita</p>
                <p className="font-medium">{searchResult.appointment.id}</p>
              </div>
              <div>
                <p className="text-sm text-primary-600">Estado</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-sm ${
                    searchResult.appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : searchResult.appointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {searchResult.appointment.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-primary-600">Fecha y Hora</p>
                <p className="font-medium">
                  {new Date(searchResult.appointment.date).toLocaleDateString()} - {searchResult.appointment.time}
                </p>
              </div>
              <div>
                <p className="text-sm text-primary-600">Tiempo Restante</p>
                <p className="font-medium">
                  {appointmentService.calculateTimeRemaining(
                    searchResult.appointment.date,
                    searchResult.appointment.time
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-primary-600">Creada el</p>
                <p className="font-medium">
                  {new Date(searchResult.appointment.createdAt).toLocaleString()}
                </p>
              </div>
              {searchResult.appointment.updatedAt && (
                <div>
                  <p className="text-sm text-primary-600">Última actualización</p>
                  <p className="font-medium">
                    {new Date(searchResult.appointment.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="card">
            <h3 className="font-serif text-xl mb-6 flex items-center space-x-2">
              <User className="w-5 h-5 text-primary-600" />
              <span>Información del Cliente</span>
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-primary-600">Nombre</p>
                <p className="font-medium">{searchResult.appointment.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-primary-600">ID del Cliente</p>
                <p className="font-medium">{searchResult.appointment.clientId}</p>
              </div>
              <div>
                <p className="text-sm text-primary-600">Teléfono</p>
                <p className="font-medium">{searchResult.appointment.clientPhone}</p>
              </div>
            </div>
          </div>

          {/* Información del Local */}
          <div className="card md:col-span-2">
            <h3 className="font-serif text-xl mb-6 flex items-center space-x-2">
              <Store className="w-5 h-5 text-primary-600" />
              <span>Información del Local</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-primary-600">Nombre del Local</p>
                  <p className="font-medium">{searchResult.shop.name}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-600">ID del Local</p>
                  <p className="font-medium">{searchResult.shop.id}</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Phone className="w-4 h-4 text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-primary-600">Teléfono</p>
                    <p className="font-medium">{searchResult.shop.phone}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-primary-600">Horario</p>
                    <p className="font-medium">
                      {searchResult.shop.openingTime} - {searchResult.shop.closingTime}
                    </p>
                    <p className="text-sm text-primary-500">
                      {searchResult.shop.workingDays.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-primary-600">Dirección</p>
                    <p className="font-medium">{searchResult.shop.address}</p>
                    <div className="text-sm text-primary-500 mt-1">
                      <p><strong>Calle:</strong> {searchResult.shop.street}</p>
                      <p><strong>Número:</strong> {searchResult.shop.number}</p>
                      <p><strong>Colonia:</strong> {searchResult.shop.colony}</p>
                      <p><strong>Ciudad:</strong> {searchResult.shop.city}</p>
                      <p><strong>Estado:</strong> {searchResult.shop.state}</p>
                      <p><strong>CP:</strong> {searchResult.shop.zipCode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}