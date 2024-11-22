import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';
import { shopService } from '../services/shopService';
import { Shop } from '../types/shop';
import { localDB } from '../services/localDatabase';
import toast from 'react-hot-toast';
import ShopForm from '../components/shop/ShopForm';
import ShopListItem from '../components/shop/ShopListItem';
import ShopSearch from '../components/shop/ShopSearch';

interface DeleteShopModalProps {
  shop: Shop;
  onDelete: (reason: string) => void;
  onClose: () => void;
}

interface MemberManagementModalProps {
  shop: Shop;
  onClose: () => void;
  onUpdate: () => void;
}

function DeleteShopModal({ shop, onDelete, onClose }: DeleteShopModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Por favor proporciona un motivo para la eliminación');
      return;
    }
    onDelete(reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium mb-4">Eliminar Local</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Motivo de la eliminación
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Explica el motivo de la eliminación..."
              required
            />
          </div>
          <div className="flex space-x-4">
            <button type="submit" className="btn btn-primary flex-1">
              Confirmar Eliminación
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

function MemberManagementModal({ shop, onClose, onUpdate }: MemberManagementModalProps) {
  const members = shop.barberIds.map(id => {
    const barber = localDB.getAllUsers().find(user => user.id === id);
    return barber ? {
      id: barber.id,
      name: barber.name,
      email: barber.email,
      isOwner: shop.ownerId === barber.id
    } : null;
  }).filter(member => member !== null);

  const handleTransferOwnership = async (newOwnerId: string, currentOwnerName: string, newOwnerName: string) => {
    try {
      await shopService.transferOwnership(shop.id, newOwnerId, currentOwnerName, newOwnerName);
      toast.success('Propiedad transferida exitosamente');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Error al transferir la propiedad');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      await shopService.leaveShop(shop.id, memberId, memberName);
      toast.success('Miembro removido exitosamente');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Error al remover al miembro');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif">Gestión de Miembros - {shop.name}</h2>
          <button onClick={onClose} className="text-primary-600 hover:text-primary-800">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {members.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{member.name}</span>
                  {member.isOwner && (
                    <span className="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
                      Dueño
                    </span>
                  )}
                </div>
                <p className="text-sm text-primary-600">{member.email}</p>
              </div>
              {!member.isOwner && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTransferOwnership(member.id, shop.ownerId, member.name)}
                    className="btn btn-secondary text-sm"
                  >
                    Transferir Propiedad
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="btn btn-secondary text-sm text-red-500"
                  >
                    Expulsar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn btn-primary w-full mt-6">
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default function AdminShopManagement() {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [showMemberModal, setShowMemberModal] = useState<Shop | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Shop | null>(null);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = () => {
    const allShops = shopService.getShops();
    setShops(allShops);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const allShops = shopService.getShops();
    if (term) {
      const filtered = allShops.filter(shop => 
        shop.name.toLowerCase().includes(term.toLowerCase()) ||
        shop.address.toLowerCase().includes(term.toLowerCase())
      );
      setShops(filtered);
    } else {
      setShops(allShops);
    }
  };

  const handleToggleStatus = async (shop: Shop) => {
    try {
      const updatedShop = shopService.updateShop(shop.id, {
        isActive: !shop.isActive
      });
      loadShops();
      toast.success(`Local ${shop.isActive ? 'bloqueado' : 'desbloqueado'} exitosamente`);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el estado del local');
    }
  };

  const handleDeleteShop = async (shop: Shop, reason: string) => {
    try {
      await shopService.deleteShop(shop.id, 'admin', reason);
      loadShops();
      setShowDeleteModal(null);
      toast.success('Local eliminado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el local');
    }
  };

  const handleUpdateShop = async (data: any) => {
    if (!editingShop) return;

    try {
      const updatedShop = shopService.updateShop(editingShop.id, data);
      setEditingShop(null);
      loadShops();
      toast.success('Local actualizado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el local');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 to-primary-800 text-white p-8 rounded-2xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Store className="w-12 h-12" />
            <div>
              <h1 className="font-serif text-3xl mb-2">Gestión de Locales</h1>
              <p className="text-primary-100">Administra los locales del sistema</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <ShopSearch value={searchTerm} onChange={handleSearch} />
      </div>

      {/* Shop List */}
      <div className="space-y-6">
        {editingShop ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl">Editar Local</h2>
              <button
                onClick={() => setEditingShop(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
            <ShopForm
              onSubmit={handleUpdateShop}
              initialData={editingShop}
              isEdit
            />
          </div>
        ) : (
          shops.map(shop => (
            <ShopListItem
              key={shop.id}
              shop={shop}
              onEdit={() => setEditingShop(shop)}
              onToggleStatus={() => handleToggleStatus(shop)}
              onDelete={() => setShowDeleteModal(shop)}
              onManageMembers={() => setShowMemberModal(shop)}
            />
          ))
        )}

        {shops.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <p className="text-primary-600 text-lg">
              No se encontraron locales
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showMemberModal && (
        <MemberManagementModal
          shop={showMemberModal}
          onClose={() => setShowMemberModal(null)}
          onUpdate={loadShops}
        />
      )}

      {showDeleteModal && (
        <DeleteShopModal
          shop={showDeleteModal}
          onDelete={(reason) => handleDeleteShop(showDeleteModal, reason)}
          onClose={() => setShowDeleteModal(null)}
        />
      )}
    </div>
  );
}