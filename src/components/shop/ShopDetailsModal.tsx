import { useState, useEffect } from 'react';
import { X, Users, Calendar, MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { Shop } from '../../types/shop';
import { localDB } from '../../services/localDatabase';
import AppointmentForm from './AppointmentForm';

interface ShopDetailsModalProps {
  shop: Shop;
  onClose: () => void;
}

interface Barber {
  id: string;
  name: string;
  joinedAt: string;
}

function formatAddress(shop: Shop): string {
  return `${shop.street} ${shop.number}, ${shop.colony}, ${shop.city}, ${shop.state}, CP ${shop.zipCode}`;
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function formatDescription(description: string): JSX.Element {
  const words = description.split(' ');
  return (
    <>
      {words.map((word, index) => {
        if (isValidUrl(word)) {
          return (
            <span key={index}>
              <a
                href={word}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 underline inline-flex items-center"
              >
                {word}
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>{' '}
            </span>
          );
        }
        return word + ' ';
      })}
    </>
  );
}

export default function ShopDetailsModal({ shop, onClose }: ShopDetailsModalProps) {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    const shopBarbers = shop.barberIds.map(id => {
      const barber = localDB.getAllUsers().find(user => user.id === id);
      return barber ? {
        id: barber.id,
        name: barber.name,
        joinedAt: new Date().toISOString() // In a real app, this would come from the database
      } : null;
    }).filter((barber): barber is Barber => barber !== null);
    
    setBarbers(shopBarbers);
  }, [shop]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-primary-100 p-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-2xl">{shop.name}</h2>
            <button
              onClick={onClose}
              className="text-primary-600 hover:text-primary-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Photos Gallery */}
          <div className="grid grid-cols-3 gap-4">
            {shop.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`${shop.name} ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>

          {/* Description */}
          {shop.description && (
            <div>
              <h3 className="font-medium text-lg mb-2">Acerca del Local</h3>
              <p className="text-primary-600">
                {formatDescription(shop.description)}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <h4 className="font-medium">Horario</h4>
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
                  <h4 className="font-medium">Ubicación</h4>
                  <p className="text-primary-600">{formatAddress(shop)}</p>
                  <p className="text-sm text-primary-500 mt-1">
                    <strong>Calle:</strong> {shop.street}<br />
                    <strong>Número:</strong> {shop.number}<br />
                    <strong>Colonia:</strong> {shop.colony}<br />
                    <strong>Ciudad:</strong> {shop.city}<br />
                    <strong>Estado:</strong> {shop.state}<br />
                    <strong>CP:</strong> {shop.zipCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <h4 className="font-medium">Contacto</h4>
                  <p className="text-primary-600">{shop.phone}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-5 h-5 text-primary-600" />
                <h4 className="font-medium">Nuestros Barberos</h4>
              </div>
              <div className="space-y-3">
                {barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className="flex items-center justify-between p-3 bg-primary-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{barber.name}</p>
                      <p className="text-sm text-primary-500">
                        Se unió el {new Date(barber.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {barber.id === shop.ownerId && (
                      <span className="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
                        Dueño
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          {showAppointmentForm ? (
            <div>
              <AppointmentForm
                shop={shop}
                onSuccess={() => {
                  setShowAppointmentForm(false);
                  onClose();
                }}
              />
              <button
                onClick={() => setShowAppointmentForm(false)}
                className="btn btn-secondary w-full mt-4"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAppointmentForm(true)}
              className="btn btn-primary w-full"
            >
              Agendar Cita
            </button>
          )}
        </div>
      </div>
    </div>
  );
}