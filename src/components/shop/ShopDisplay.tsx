import { Clock, MapPin, Phone, Users, Trash2, Crown } from 'lucide-react';
import { useState } from 'react';
import { Shop } from '../../types/shop';
import { shopService } from '../../services/shopService';
import { useAuthStore } from '../../stores/authStore';
import BlockedShopBanner from './BlockedShopBanner';
import toast from 'react-hot-toast';

interface ShopDisplayProps {
  shop: Shop;
  isOwner?: boolean;
  onEdit?: () => void;
  onToggleStatus?: () => void;
}

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

export default function ShopDisplay({
  shop,
  isOwner,
  onEdit,
  onToggleStatus,
}: ShopDisplayProps) {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const user = useAuthStore((state) => state.user);

  const barbers = shop.barberIds
    .filter(id => id !== shop.ownerId)
    .map(id => {
      const barber = shopService.getBarberById(id);
      return barber ? { id: barber.id, name: barber.name } : null;
    })
    .filter((barber): barber is { id: string; name: string } => barber !== null);

  const handleDeleteShop = async () => {
    if (!user) return;
    
    if (!shop.isActive) {
      toast.error('No puedes eliminar un local bloqueado');
      return;
    }
    
    if (window.confirm('¿Estás seguro que deseas eliminar este local? Esta acción no se puede deshacer.')) {
      try {
        await shopService.deleteShop(shop.id, user.id);
        toast.success('Local eliminado exitosamente');
        window.location.reload();
      } catch (error: any) {
        toast.error(error.message || 'Error al eliminar el local');
      }
    }
  };

  const handleLeaveShop = async () => {
    if (!user) return;
    
    if (!shop.isActive) {
      toast.error('No puedes abandonar un local bloqueado');
      return;
    }
    
    try {
      await shopService.leaveShop(shop.id, user.id, user.name);
      toast.success('Has abandonado el local exitosamente');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Error al abandonar el local');
    }
  };

  const handleTransferOwnership = async (newOwnerId: string, barberName: string) => {
    try {
      if (!user || !shop.isActive) {
        toast.error('No puedes transferir la propiedad de un local bloqueado');
        return;
      }
      
      await shopService.transferOwnership(shop.id, newOwnerId, user.name, barberName);
      toast.success(`Propiedad transferida exitosamente a ${barberName}`);
      setShowTransferModal(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Error al transferir la propiedad');
    }
  };

  const isOpen = () => {
    if (!shop.isActive) return false;
    
    const now = new Date();
    const currentDay = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ][now.getDay()];
    
    if (!shop.workingDays.includes(currentDay)) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMinute] = shop.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = shop.closingTime.split(':').map(Number);
    const openingTime = openHour * 60 + openMinute;
    const closingTime = closeHour * 60 + closeMinute;

    return currentTime >= openingTime && currentTime < closingTime;
  };

  return (
    <div className="space-y-6">
      {!shop.isActive && <BlockedShopBanner />}
      
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-serif text-2xl mb-2">{shop.name}</h2>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm ${
                isOpen()
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isOpen() ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
          {isOwner && shop.isActive && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
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
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-primary-600 mt-1" />
              <div>
                <h3 className="font-medium">Horario</h3>
                <p className="text-primary-600">
                  {shop.openingTime} - {shop.closingTime}
                </p>
                <p className="text-sm text-primary-500">
                  {shop.workingDays.join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-primary-600 mt-1" />
              <div>
                <h3 className="font-medium">Ubicación</h3>
                <p className="text-primary-600">{shop.address}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-primary-600 mt-1" />
              <div>
                <h3 className="font-medium">Contacto</h3>
                <p className="text-primary-600">{shop.phone}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary-600" />
                <h3 className="font-medium">Barberos</h3>
              </div>
              {isOwner && shop.isActive && barbers.length > 0 && (
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>Transferir Propiedad</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {shop.barberIds.map((barberId) => {
                const barber = shopService.getBarberById(barberId);
                if (!barber) return null;

                return (
                  <div
                    key={barberId}
                    className="flex items-center justify-between p-3 bg-primary-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{barber.name}</span>
                      {barberId === shop.ownerId && (
                        <Crown className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                    {user?.id === barberId && !isOwner && shop.isActive && (
                      <button
                        onClick={handleLeaveShop}
                        className="btn btn-secondary text-red-500 text-sm"
                      >
                        Abandonar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {isOwner && shop.isActive && (
              <div className="mt-4">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Código de unión:</p>
                  <code className="bg-white px-2 py-1 rounded text-sm break-all">
                    {shop.joinCode}
                  </code>
                  <p className="text-xs text-primary-500 mt-2">
                    Comparte este código con otros barberos para que se unan a tu local
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showTransferModal && (
        <TransferOwnershipModal
          shop={shop}
          onClose={() => setShowTransferModal(false)}
          onTransfer={handleTransferOwnership}
          barbers={barbers}
        />
      )}
    </div>
  );
}