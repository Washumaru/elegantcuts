import { useState, useEffect } from 'react';
import { Store, Plus, Calendar, Users, Settings, Clock, MapPin, Phone, Crown, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { shopService } from '../../services/shopService';
import { appointmentService } from '../../services/appointmentService';
import { Shop } from '../../types/shop';
import { Appointment } from '../../types/appointment';
import ShopForm from '../../components/shop/ShopForm';
import JoinShopForm from '../../components/shop/JoinShopForm';
import AppointmentList from '../../components/appointments/AppointmentList';
import ScheduleManager from '../../components/schedule/ScheduleManager';
import BlockedShopBanner from '../../components/shop/BlockedShopBanner';
import toast from 'react-hot-toast';

interface TransferOwnershipModalProps {
  shop: Shop;
  onClose: () => void;
  onTransfer: (newOwnerId: string, barberName: string) => void;
  barbers: Array<{ id: string; name: string }>;
}

function TransferOwnershipModal({ shop, onClose, onTransfer, barbers }: TransferOwnershipModalProps) {
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const selectedBarber = barbers.find(b => b.id === selectedBarberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarberId || !selectedBarber) {
      toast.error('Por favor selecciona un barbero');
      return;
    }
    onTransfer(selectedBarberId, selectedBarber.name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium mb-4">Transferir Propiedad del Local</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Seleccionar Nuevo Dueño
            </label>
            <select
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="input"
              required
            >
              <option value="">Selecciona un barbero</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>
          {selectedBarber && (
            <p className="text-sm text-primary-600">
              Transferirás la propiedad a: <strong>{selectedBarber.name}</strong>
            </p>
          )}
          <div className="flex space-x-4">
            <button type="submit" className="btn btn-primary flex-1">
              Transferir Propiedad
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BarberDashboard() {
  const user = useAuthStore((state) => state.user);
  const [shop, setShop] = useState<Shop | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      loadShopAndAppointments();
    }
  }, [user]);

  const loadShopAndAppointments = () => {
    if (!user) return;
    
    const barberShop = shopService.getShopByBarber(user.id);
    setShop(barberShop);

    if (barberShop && barberShop.isActive) {
      const barberAppointments = appointmentService.getBarberAppointments(user.id, barberShop.id);
      setAppointments(barberAppointments.filter(apt => apt.status !== 'cancelled'));
    } else {
      setAppointments([]);
    }
  };

  const handleCreateShop = async (data: any) => {
    if (!user) return;

    try {
      const newShop = shopService.createShop(data, user.id);
      setShop(newShop);
      setShowCreateForm(false);
      setIsEditing(false);
      toast.success('Local creado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el local');
    }
  };

  const handleUpdateShop = async (data: any) => {
    if (!shop || !user) return;

    try {
      const updatedShop = shopService.updateShop(shop.id, data);
      setShop(updatedShop);
      setIsEditing(false);
      toast.success('Local actualizado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el local');
    }
  };

  const handleJoinShop = async (joinCode: string) => {
    if (!user) return;

    try {
      const joinedShop = shopService.joinShop(joinCode, user.id, user.name);
      setShop(joinedShop);
      setShowJoinForm(false);
      toast.success('Te has unido al local exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al unirse al local');
    }
  };

  const handleDeleteShop = async () => {
    if (!user || !shop) return;
    
    if (window.confirm('¿Estás seguro que deseas eliminar este local? Esta acción no se puede deshacer.')) {
      try {
        await shopService.deleteShop(shop.id, user.id);
        setShop(null);
        toast.success('Local eliminado exitosamente');
      } catch (error: any) {
        toast.error(error.message || 'Error al eliminar el local');
      }
    }
  };

  const handleLeaveShop = async () => {
    if (!user || !shop) return;
    
    if (window.confirm('¿Estás seguro que deseas abandonar este local?')) {
      try {
        await shopService.leaveShop(shop.id, user.id, user.name);
        setShop(null);
        toast.success('Has abandonado el local exitosamente');
      } catch (error: any) {
        toast.error(error.message || 'Error al abandonar el local');
      }
    }
  };

  const handleTransferOwnership = async (newOwnerId: string, barberName: string) => {
    if (!user || !shop) return;
    
    try {
      await shopService.transferOwnership(shop.id, newOwnerId, user.name, barberName);
      const updatedShop = shopService.getShopById(shop.id);
      if (updatedShop) {
        setShop(updatedShop);
      }
      setShowTransferModal(false);
      toast.success(`Propiedad transferida exitosamente a ${barberName}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al transferir la propiedad');
    }
  };

  const getBarbersList = () => {
    if (!shop) return [];
    return shop.barberIds
      .filter(id => id !== shop.ownerId)
      .map(id => {
        const barber = shopService.getBarberById(id);
        return barber ? { id: barber.id, name: barber.name } : null;
      })
      .filter((barber): barber is { id: string; name: string } => barber !== null);
  };

  if (!user) {
    return null;
  }

  if (showCreateForm || isEditing) {
    return <ShopForm
      onSubmit={isEditing ? handleUpdateShop : handleCreateShop}
      initialData={isEditing ? shop : undefined}
      isEdit={isEditing}
      onCancel={() => {
        setShowCreateForm(false);
        setIsEditing(false);
      }}
    />;
  }

  if (showJoinForm) {
    return <JoinShopForm 
      onSubmit={handleJoinShop}
      onBack={() => setShowJoinForm(false)}
    />;
  }

  if (!shop) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="max-w-xl mx-auto text-center p-12 bg-white rounded-2xl shadow-soft-xl transform hover:scale-[1.02] transition-all duration-300">
          <div className="bg-primary-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <Store className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="font-serif text-4xl mb-6 text-primary-900">
            ¡Bienvenido a Elegant Cuts!
          </h2>
          <p className="text-primary-600 mb-10 text-lg leading-relaxed">
            Para comenzar tu viaje profesional, puedes crear tu propio local o unirte a uno existente.
            Elige la opción que mejor se adapte a ti.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary px-8 py-4 text-lg flex items-center justify-center space-x-3 transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-6 h-6" />
              <span>Crear mi Local</span>
            </button>
            <button
              onClick={() => setShowJoinForm(true)}
              className="btn btn-secondary px-8 py-4 text-lg flex items-center justify-center space-x-3 transform hover:scale-105 transition-all duration-200"
            >
              <Users className="w-6 h-6" />
              <span>Unirme a un Local</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!shop.isActive) {
    return (
      <div className="max-w-7xl mx-auto">
        <BlockedShopBanner />
        <div className="bg-white rounded-2xl shadow-soft-xl p-8 animate-fade-in">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="font-serif text-3xl mb-2">{shop.name}</h1>
              <div className="flex items-center space-x-2 text-primary-600">
                {shop.ownerId === user.id && (
                  <span className="flex items-center space-x-1 bg-primary-100 px-3 py-1 rounded-full text-sm">
                    <Crown className="w-4 h-4" />
                    <span>Propietario</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-primary-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="w-5 h-5 text-primary-600" />
                <h3 className="font-medium">Horario</h3>
              </div>
              <p className="text-primary-700">{shop.openingTime} - {shop.closingTime}</p>
              <p className="text-sm text-primary-500 mt-1">{shop.workingDays.join(', ')}</p>
            </div>

            <div className="bg-primary-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h3 className="font-medium">Ubicación</h3>
              </div>
              <div className="text-primary-700">
                <p><strong>Calle:</strong> {shop.street}</p>
                <p><strong>Número:</strong> {shop.number}</p>
                <p><strong>Colonia:</strong> {shop.colony}</p>
                <p><strong>Ciudad:</strong> {shop.city}</p>
                <p><strong>Estado:</strong> {shop.state}</p>
                <p><strong>CP:</strong> {shop.zipCode}</p>
              </div>
            </div>

            <div className="bg-primary-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Phone className="w-5 h-5 text-primary-600" />
                <h3 className="font-medium">Contacto</h3>
              </div>
              <p className="text-primary-700">{shop.phone}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-soft-xl p-8 animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="font-serif text-3xl mb-2">{shop.name}</h1>
                <div className="flex items-center space-x-2 text-primary-600">
                  {shop.ownerId === user.id && (
                    <span className="flex items-center space-x-1 bg-primary-100 px-3 py-1 rounded-full text-sm">
                      <Crown className="w-4 h-4" />
                      <span>Propietario</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                {shop.ownerId === user.id ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-secondary"
                    >
                      Editar Local
                    </button>
                    <button
                      onClick={handleDeleteShop}
                      className="btn btn-secondary text-red-500"
                    >
                      Eliminar Local
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLeaveShop}
                    className="btn btn-secondary text-red-500"
                  >
                    Abandonar Local
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-primary-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <h3 className="font-medium">Horario</h3>
                </div>
                <p className="text-primary-700">{shop.openingTime} - {shop.closingTime}</p>
                <p className="text-sm text-primary-500 mt-1">{shop.workingDays.join(', ')}</p>
              </div>

              <div className="bg-primary-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <h3 className="font-medium">Ubicación</h3>
                </div>
                <div className="text-primary-700">
                  <p><strong>Calle:</strong> {shop.street}</p>
                  <p><strong>Número:</strong> {shop.number}</p>
                  <p><strong>Colonia:</strong> {shop.colony}</p>
                  <p><strong>Ciudad:</strong> {shop.city}</p>
                  <p><strong>Estado:</strong> {shop.state}</p>
                  <p><strong>CP:</strong> {shop.zipCode}</p>
                </div>
              </div>

              <div className="bg-primary-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Phone className="w-5 h-5 text-primary-600" />
                  <h3 className="font-medium">Contacto</h3>
                </div>
                <p className="text-primary-700">{shop.phone}</p>
              </div>
            </div>

            {shop.ownerId === user.id && (
              <div className="mt-6 p-4 bg-primary-50 rounded-xl">
                <h3 className="font-medium mb-2">Código de Unión</h3>
                <div className="bg-white p-3 rounded-lg">
                  <code className="text-lg font-mono">{shop.joinCode}</code>
                  <p className="text-sm text-primary-500 mt-2">
                    Comparte este código con otros barberos para que se unan a tu local
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-soft-xl p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl">Equipo de Trabajo</h2>
              {shop.ownerId === user.id && getBarbersList().length > 0 && (
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="btn btn-secondary"
                >
                  Transferir Propiedad
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {shop.barberIds.map((barberId) => {
                const barber = shopService.getBarberById(barberId);
                if (!barber) return null;

                return (
                  <div
                    key={barberId}
                    className="bg-primary-50 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{barber.name}</span>
                        {barberId === shop.ownerId && (
                          <Crown className="w-4 h-4 text-primary-600" />
                        )}
                      </div>
                      <p className="text-sm text-primary-500">{barber.email}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-soft-xl p-6 animate-fade-in">
            <button
              onClick={() => setShowScheduleManager(true)}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Gestionar Horarios</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-soft-xl p-6 animate-fade-in">
            <AppointmentList
              appointments={appointments}
              onRefresh={loadShopAndAppointments}
              isBarber
            />
          </div>
        </div>
      </div>

      {showScheduleManager && shop && (
        <ScheduleManager
          shop={shop}
          onClose={() => setShowScheduleManager(false)}
          onUpdate={(updatedShop) => {
            setShop(updatedShop);
            setShowScheduleManager(false);
          }}
          isOwner={shop.ownerId === user.id}
        />
      )}

      {showTransferModal && shop && (
        <TransferOwnershipModal
          shop={shop}
          onClose={() => setShowTransferModal(false)}
          onTransfer={handleTransferOwnership}
          barbers={getBarbersList()}
        />
      )}
    </div>
  );
}