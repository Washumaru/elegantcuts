import { useState } from 'react';
import { Calendar, RefreshCw, X, MessageSquare, UserCheck } from 'lucide-react';
import { Appointment } from '../../types/appointment';
import { appointmentService } from '../../services/appointmentService';
import { notificationService } from '../../services/notificationService';
import toast from 'react-hot-toast';

interface AppointmentListProps {
  appointments: Appointment[];
  onRefresh: () => void;
  isBarber?: boolean;
}

interface CancelModalProps {
  appointment: Appointment;
  onCancel: (reason: string) => void;
  onClose: () => void;
}

function CancelModal({ appointment, onCancel, onClose }: CancelModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Por favor, proporciona un motivo para la cancelación');
      return;
    }
    onCancel(reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium mb-4">Cancelar Cita</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Motivo de la cancelación
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Explica el motivo de la cancelación..."
              required
            />
          </div>
          <div className="flex space-x-4">
            <button type="submit" className="btn btn-primary flex-1">
              Confirmar Cancelación
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

export default function AppointmentList({
  appointments,
  onRefresh,
  isBarber = false,
}: AppointmentListProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleCancelAppointment = async (reason: string) => {
    if (!selectedAppointment) return;

    try {
      await appointmentService.updateAppointmentStatus(selectedAppointment.id, 'cancelled');
      
      // Create cancellation notification
      notificationService.createNotification({
        type: 'appointment_cancel',
        message: `Tu cita ha sido cancelada por el barbero. Motivo: ${reason}`,
        userId: selectedAppointment.clientId,
        appointmentId: selectedAppointment.id,
        reason,
      });

      toast.success('Cita cancelada exitosamente');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar la cita');
    } finally {
      setShowCancelModal(false);
      setSelectedAppointment(null);
    }
  };

  const formatDate = (dateString: string) => {
    // Crear la fecha sin ajuste de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  const getTimeStatus = (appointment: Appointment) => {
    const timeRemaining = appointmentService.calculateTimeRemaining(appointment.date, appointment.time);
    if (timeRemaining === 'Cita pasada') {
      return <span className="text-red-500 text-xs">Cita pasada</span>;
    }
    return <span className="text-primary-500 text-xs">En {timeRemaining}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          <span>Citas Programadas</span>
        </h3>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-primary-100 rounded-full"
          title="Actualizar citas"
        >
          <RefreshCw className="w-5 h-5 text-primary-600" />
        </button>
      </div>

      {appointments.length === 0 ? (
        <p className="text-primary-600 text-center py-4">
          No hay citas programadas
        </p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`p-4 rounded-lg ${
                appointment.barberId ? 'bg-green-50 border border-green-200' : 'bg-primary-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{appointment.clientName}</p>
                    {appointment.barberId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Barbero Asignado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-primary-600">
                    {formatDate(appointment.date)} - {appointment.time}
                  </p>
                  <p className="text-sm text-primary-500">
                    Tel: {appointment.clientPhone}
                  </p>
                  {getTimeStatus(appointment)}
                </div>
                {isBarber && appointment.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowCancelModal(true);
                    }}
                    className="btn btn-secondary text-red-500 flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                )}
              </div>
              {appointment.barberId && (
                <div className="mt-2 text-sm text-green-700 bg-green-100 p-2 rounded">
                  <p>El cliente te ha seleccionado específicamente para esta cita.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCancelModal && selectedAppointment && (
        <CancelModal
          appointment={selectedAppointment}
          onCancel={handleCancelAppointment}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}