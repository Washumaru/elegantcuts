import { Users, Edit, Lock, Unlock, Trash2 } from 'lucide-react';
import { Shop } from '../../types/shop';

interface ShopListItemProps {
  shop: Shop;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onManageMembers: () => void;
}

export default function ShopListItem({
  shop,
  onEdit,
  onToggleStatus,
  onDelete,
  onManageMembers,
}: ShopListItemProps) {
  return (
    <div className="bg-white rounded-xl shadow-soft-xl p-6 hover:shadow-soft-2xl transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="font-serif text-xl">{shop.name}</h3>
          <p className="text-primary-600">{shop.address}</p>
          <p className="text-sm text-primary-500">Tel: {shop.phone}</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm ${
              shop.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {shop.isActive ? 'Activo' : 'Bloqueado'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onManageMembers}
            className="btn btn-secondary flex items-center space-x-2"
            title="Gestionar miembros"
          >
            <Users className="w-4 h-4" />
            <span>Miembros</span>
          </button>
          <button
            onClick={onEdit}
            className="btn btn-secondary flex items-center space-x-2"
            title="Editar local"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={onToggleStatus}
            className="btn btn-secondary flex items-center space-x-2"
            title={shop.isActive ? 'Bloquear local' : 'Desbloquear local'}
          >
            {shop.isActive ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Bloquear</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Desbloquear</span>
              </>
            )}
          </button>
          <button
            onClick={onDelete}
            className="btn btn-secondary flex items-center space-x-2 text-red-500"
            title="Eliminar local"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
}