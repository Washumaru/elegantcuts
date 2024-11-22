import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, AlertTriangle } from 'lucide-react';
import { Shop } from '../../types/shop';
import { shopService } from '../../services/shopService';
import toast from 'react-hot-toast';

interface ScheduleManagerProps {
  shop: Shop;
  onClose: () => void;
  onUpdate: (updatedShop: Shop) => void;
  isOwner: boolean;
}

interface TimeSlot {
  time: string;
  duration: number;
}

export default function ScheduleManager({ shop, onClose, onUpdate, isOwner }: ScheduleManagerProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (shop.availableTimeSlots && shop.availableTimeSlots.length > 0) {
      setTimeSlots(shop.availableTimeSlots);
    } else {
      // Horarios predeterminados si no hay personalizados
      setTimeSlots([
        { time: '09:00', duration: 60 },
        { time: '10:00', duration: 60 },
        { time: '11:00', duration: 60 },
        { time: '12:00', duration: 60 },
        { time: '13:00', duration: 60 },
        { time: '14:00', duration: 60 },
        { time: '15:00', duration: 60 },
        { time: '16:00', duration: 60 },
        { time: '17:00', duration: 60 },
      ]);
    }
  }, [shop]);

  const handleAddTimeSlot = () => {
    const lastSlot = timeSlots[timeSlots.length - 1];
    if (!lastSlot) {
      setTimeSlots([{ time: '09:00', duration: 60 }]);
      return;
    }

    const [hours, minutes] = lastSlot.time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + lastSlot.duration;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    
    const newTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    
    setTimeSlots([...timeSlots, { time: newTime, duration: 60 }]);
  };

  const handleRemoveTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleUpdateTimeSlot = (index: number, field: keyof TimeSlot, value: string | number) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = {
      ...updatedSlots[index],
      [field]: value
    };
    setTimeSlots(updatedSlots);
  };

  const handleSave = async () => {
    try {
      // Ordenar los horarios por tiempo antes de guardar
      const sortedSlots = [...timeSlots].sort((a, b) => {
        const [aHours, aMinutes] = a.time.split(':').map(Number);
        const [bHours, bMinutes] = b.time.split(':').map(Number);
        const aTotal = aHours * 60 + aMinutes;
        const bTotal = bHours * 60 + bMinutes;
        return aTotal - bTotal;
      });

      // Actualizar el horario del local
      const updatedShop = shopService.updateShop(shop.id, {
        availableTimeSlots: sortedSlots
      });
      
      toast.success('Horarios actualizados exitosamente');
      onUpdate(updatedShop);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar los horarios');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif">Horarios de Citas del Local</h2>
          <button
            onClick={onClose}
            className="text-primary-600 hover:text-primary-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isOwner && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Solo el dueño del local puede modificar los horarios. Como miembro, puedes ver los horarios pero no modificarlos.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 font-medium text-sm text-primary-600">
            <div>Hora</div>
            <div>Duración (minutos)</div>
            <div></div>
          </div>

          {timeSlots.map((slot, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 items-center">
              <input
                type="time"
                value={slot.time}
                onChange={(e) => handleUpdateTimeSlot(index, 'time', e.target.value)}
                className="input"
                disabled={!isOwner}
              />
              <select
                value={slot.duration}
                onChange={(e) => handleUpdateTimeSlot(index, 'duration', Number(e.target.value))}
                className="input"
                disabled={!isOwner}
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1 hora 30 minutos</option>
                <option value={120}>2 horas</option>
              </select>
              {isOwner && (
                <button
                  onClick={() => handleRemoveTimeSlot(index)}
                  className="btn btn-secondary p-2 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {isOwner && (
            <>
              <button
                onClick={handleAddTimeSlot}
                className="btn btn-secondary w-full flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Horario</span>
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}

          {!isOwner && (
            <button
              onClick={onClose}
              className="btn btn-primary w-full"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}