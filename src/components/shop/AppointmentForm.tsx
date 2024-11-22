import { useState, useEffect } from 'react';
import { Shop } from '../../types/shop';
import { appointmentService } from '../../services/appointmentService';
import { localDB } from '../../services/localDatabase';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

interface AppointmentFormProps {
  shop: Shop;
  onSuccess: () => void;
}

interface Barber {
  id: string;
  name: string;
}

export default function AppointmentForm({ shop, onSuccess }: AppointmentFormProps) {
  const user = useAuthStore((state) => state.user);
  const [formData, setFormData] = useState({
    clientName: user?.name || '',
    clientPhone: '',
    date: '',
    time: '',
    withBarber: false,
    barberId: '',
  });

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    // Get barbers information
    const shopBarbers = shop.barberIds.map(id => {
      const barber = localDB.getAllUsers().find(user => user.id === id);
      return barber ? { id: barber.id, name: barber.name } : null;
    }).filter((barber): barber is Barber => barber !== null);
    
    setBarbers(shopBarbers);
  }, [shop]);

  const isDateAvailable = (date: string) => {
    const selectedDate = new Date(date);
    // Ajustar el array para que coincida con el formato usado en el resto de la aplicación
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    // Ajustar el índice del día para que coincida con nuestro array
    let dayIndex = selectedDate.getDay();
    const dayName = dayNames[dayIndex];
    return shop.workingDays.includes(dayName);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setFormData({ ...formData, date, time: '' });
    if (isDateAvailable(date)) {
      updateAvailableTimeSlots(date, formData.barberId);
    } else {
      setAvailableTimeSlots([]);
    }
  };

  const updateAvailableTimeSlots = (date: string, barberId?: string) => {
    if (!isDateAvailable(date)) {
      setAvailableTimeSlots([]);
      return;
    }

    // Usar los horarios definidos por el local
    if (shop.availableTimeSlots && shop.availableTimeSlots.length > 0) {
      const slots = shop.availableTimeSlots
        .map(slot => slot.time)
        .filter(time => {
          if (barberId) {
            // Si se seleccionó un barbero específico, verificar su disponibilidad
            return appointmentService.isTimeSlotAvailable(shop.id, date, time, barberId);
          }
          // Si no se seleccionó barbero, verificar si hay al menos un barbero disponible
          return shop.barberIds.some(bid => 
            appointmentService.isTimeSlotAvailable(shop.id, date, time, bid)
          );
        });
      setAvailableTimeSlots(slots);
      return;
    }

    // Fallback a los horarios predeterminados
    const slots: string[] = [];
    const [openHour, openMinute] = shop.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = shop.closingTime.split(':').map(Number);
    
    let currentTime = openHour * 60 + openMinute;
    const endTime = closeHour * 60 + closeMinute;

    while (currentTime < endTime) {
      const hour = Math.floor(currentTime / 60);
      const minute = currentTime % 60;
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      
      if (barberId) {
        // Si se seleccionó un barbero específico, verificar su disponibilidad
        if (appointmentService.isTimeSlotAvailable(shop.id, date, timeString, barberId)) {
          slots.push(timeString);
        }
      } else {
        // Si no se seleccionó barbero, verificar si hay al menos un barbero disponible
        if (shop.barberIds.some(bid => 
          appointmentService.isTimeSlotAvailable(shop.id, date, timeString, bid)
        )) {
          slots.push(timeString);
        }
      }

      currentTime += 60; // Intervalos de 1 hora por defecto
    }

    setAvailableTimeSlots(slots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Debes iniciar sesión para agendar una cita');
      return;
    }

    if (!isDateAvailable(formData.date)) {
      toast.error('El local no abre este día');
      return;
    }

    try {
      await appointmentService.createAppointment({
        shopId: shop.id,
        clientId: user.id,
        clientName: user.name,
        clientPhone: formData.clientPhone,
        date: formData.date,
        time: formData.time,
        barberId: formData.withBarber ? formData.barberId : undefined,
      });

      toast.success('Cita agendada exitosamente');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al agendar la cita');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-primary-700 mb-1">
          Nombre Completo
        </label>
        <input
          type="text"
          required
          className="input bg-gray-100"
          value={user?.name || ''}
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary-700 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          required
          className="input"
          value={formData.clientPhone}
          onChange={(e) =>
            setFormData({ ...formData, clientPhone: e.target.value })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary-700 mb-1">
          Fecha
        </label>
        <input
          type="date"
          required
          min={new Date().toISOString().split('T')[0]}
          className="input"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
        />
        {selectedDate && !isDateAvailable(selectedDate) && (
          <p className="mt-1 text-sm text-red-600">
            El local no abre este día. Días disponibles: {shop.workingDays.join(', ')}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.withBarber}
            onChange={(e) => {
              const checked = e.target.checked;
              setFormData({ ...formData, withBarber: checked, barberId: '' });
              if (!checked && selectedDate) {
                updateAvailableTimeSlots(selectedDate);
              }
            }}
            className="text-primary-600"
          />
          <span className="text-sm text-primary-700">
            Agendar con un barbero específico
          </span>
        </label>
      </div>

      {formData.withBarber && (
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">
            Seleccionar Barbero
          </label>
          <select
            required
            className="input"
            value={formData.barberId}
            onChange={(e) => {
              const barberId = e.target.value;
              setFormData({ ...formData, barberId });
              if (selectedDate) {
                updateAvailableTimeSlots(selectedDate, barberId);
              }
            }}
          >
            <option value="">Selecciona un barbero</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedDate && isDateAvailable(selectedDate) && (
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">
            Hora
          </label>
          <div className="grid grid-cols-4 gap-2">
            {availableTimeSlots.map((time) => (
              <button
                key={time}
                type="button"
                className={`p-2 rounded text-sm ${
                  formData.time === time
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                }`}
                onClick={() => setFormData({ ...formData, time })}
              >
                {time}
              </button>
            ))}
          </div>
          {availableTimeSlots.length === 0 && (
            <p className="text-sm text-red-600 mt-2">
              No hay horarios disponibles para este día
              {formData.withBarber && formData.barberId && " con el barbero seleccionado"}
            </p>
          )}
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary w-full"
        disabled={
          !selectedDate || 
          !formData.time ||
          !isDateAvailable(selectedDate) ||
          (formData.withBarber && !formData.barberId)
        }
      >
        Agendar Cita
      </button>
    </form>
  );
}