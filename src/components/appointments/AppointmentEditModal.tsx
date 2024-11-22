import { useState, useEffect } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { Appointment } from '../../types/appointment';
import { appointmentService } from '../../services/appointmentService';
import { shopService } from '../../services/shopService';
import toast from 'react-hot-toast';

interface AppointmentEditModalProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdate: () => void;
}

export default function AppointmentEditModal({
  appointment,
  onClose,
  onUpdate,
}: AppointmentEditModalProps) {
  const [formData, setFormData] = useState({
    date: appointment.date,
    time: appointment.time,
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [shop, setShop] = useState(shopService.getShopById(appointment.shopId));

  useEffect(() => {
    if (shop && formData.date) {
      updateAvailableTimeSlots(formData.date);
    }
  }, [formData.date]);

  const isDateAvailable = (date: string) => {
    if (!shop) return false;
    const selectedDate = new Date(date);
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const dayName = dayNames[selectedDate.getDay()];
    return shop.workingDays.includes(dayName);
  };

  const updateAvailableTimeSlots = (date: string) => {
    if (!shop || !isDateAvailable(date)) {
      setAvailableTimeSlots([]);
      return;
    }

    // Usar los horarios definidos por el barbero si existen
    if (shop.availableTimeSlots && shop.availableTimeSlots.length > 0) {
      const slots = shop.availableTimeSlots
        .map(slot => slot.time)
        .filter(time => {
          if (appointment.barberId) {
            return appointmentService.isTimeSlotAvailable(shop.id, date, time, appointment.barberId) ||
                   (date === appointment.date && time === appointment.time);
          }
          return appointmentService.isTimeSlotAvailable(shop.id, date, time) ||
                 (date === appointment.date && time === appointment.time);
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
      
      if (appointmentService.isTimeSlotAvailable(shop.id, date, timeString) ||
          (date === appointment.date && timeString === appointment.time)) {
        slots.push(timeString);
      }

      currentTime += 60; // Intervalos de 1 hora por defecto
    }

    setAvailableTimeSlots(slots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shop) {
      toast.error('No se encontró información del local');
      return;
    }

    if (!isDateAvailable(formData.date)) {
      toast.error(`El local no abre los ${new Date(formData.date).toLocaleDateString('es-ES', { weekday: 'long' })}`);
      return;
    }

    if (!availableTimeSlots.includes(formData.time)) {
      toast.error('El horario seleccionado no está disponible');
      return;
    }

    try {
      await appointmentService.updateAppointment(appointment.id, {
        date: formData.date,
        time: formData.time,
      });
      toast.success('Cita actualizada exitosamente');
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la cita');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif">Modificar Cita</h2>
          <button
            onClick={onClose}
            className="text-primary-600 hover:text-primary-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Nueva Fecha
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="input pl-10"
                value={formData.date}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setFormData({ ...formData, date: newDate, time: '' });
                }}
              />
            </div>
            {formData.date && !isDateAvailable(formData.date) && (
              <p className="mt-1 text-sm text-red-600">
                El local no abre este día. Días disponibles: {shop?.workingDays.join(', ')}
              </p>
            )}
          </div>

          {formData.date && isDateAvailable(formData.date) && (
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Nueva Hora
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
                </p>
              )}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={!formData.date || !formData.time || !isDateAvailable(formData.date)}
            >
              Guardar Cambios
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