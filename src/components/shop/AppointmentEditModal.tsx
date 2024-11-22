import { useState } from 'react';
import { X } from 'lucide-react';
import { Appointment } from '../../types/appointment';
import { appointmentService } from '../../services/appointmentService';
import { shopService } from '../../services/shopService';
import toast from 'react-hot-toast';

interface AppointmentEditModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AppointmentEditModal({
  appointment,
  onClose,
  onSuccess,
}: AppointmentEditModalProps) {
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time);
  const shop = shopService.getShopById(appointment.shopId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!shop) throw new Error('Local no encontrado');

      // Check if the new time slot is available
      if (!appointmentService.isTimeSlotAvailable(shop.id, date, time)) {
        toast.error('Este horario ya está ocupado. Por favor elige otro.');
        return;
      }

      await appointmentService.updateAppointment(appointment.id, {
        date,
        time,
      });

      toast.success('Cita actualizada exitosamente');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la cita');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-primary-100">
          <h2 className="font-serif text-xl">Modificar Cita</h2>
          <button
            onClick={onClose}
            className="text-primary-600 hover:text-primary-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Nueva Fecha
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Nueva Hora
            </label>
            <input
              type="time"
              required
              className="input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary flex-1">
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