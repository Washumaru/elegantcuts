import { Clock, MapPin, Phone, ExternalLink } from 'lucide-react';
import { Shop } from '../../types/shop';
import { useState } from 'react';
import AppointmentForm from './AppointmentForm';
import ShopDetailsModal from './ShopDetailsModal';

interface ShopCardProps {
  shop: Shop;
  showAppointmentForm?: boolean;
}

export default function ShopCard({ shop, showAppointmentForm }: ShopCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="card">
      <div className="relative mb-4">
        <img
          src={shop.photos[0]}
          alt={shop.name}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      <h3 className="font-serif text-xl mb-4">{shop.name}</h3>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-primary-600">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <div>
            <p>{shop.openingTime} - {shop.closingTime}</p>
            <p className="text-xs text-primary-500">
              {shop.workingDays.join(', ')}
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-2 text-sm text-primary-600">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
          <div>
            <p>{shop.address}</p>
            <p className="text-xs text-primary-500">
              {shop.colony}, {shop.city}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-primary-600">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <p>{shop.phone}</p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setShowDetails(true)}
          className="btn btn-secondary w-full flex items-center justify-center space-x-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Ver Detalles del Local</span>
        </button>

        {showAppointmentForm && (
          <div>
            {showForm ? (
              <div>
                <AppointmentForm
                  shop={shop}
                  onSuccess={() => setShowForm(false)}
                />
                <button
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary w-full mt-4"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary w-full"
              >
                Agendar Cita
              </button>
            )}
          </div>
        )}
      </div>

      {showDetails && (
        <ShopDetailsModal
          shop={shop}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}