import { useState, useEffect } from 'react';
import { Upload, X, Plus, ArrowLeft, MapPin, Clock, Phone, Store } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShopFormProps {
  onSubmit: (data: ShopFormData) => void;
  initialData?: ShopFormData;
  isEdit?: boolean;
  onCancel?: () => void;
}

export interface ShopFormData {
  name: string;
  description?: string;
  photos: string[];
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  address: string;
  street: string;
  number: string;
  colony: string;
}

const DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

const DEFAULT_FORM_DATA: ShopFormData = {
  name: '',
  description: '',
  photos: [],
  openingTime: '09:00',
  closingTime: '18:00',
  workingDays: [],
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  address: '',
  street: '',
  number: '',
  colony: '',
};

export default function ShopForm({ onSubmit, initialData, isEdit, onCancel }: ShopFormProps) {
  const [formData, setFormData] = useState<ShopFormData>(DEFAULT_FORM_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (formData.photos.length + files.length > 6) {
      toast.error('Máximo 6 fotos permitidas');
      return;
    }

    const newPhotos: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          newPhotos.push(reader.result);
          if (newPhotos.length === files.length) {
            setFormData({
              ...formData,
              photos: [...formData.photos, ...newPhotos],
            });
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
    });
  };

  const updateAddress = () => {
    const fullAddress = `${formData.street} ${formData.number}, ${formData.colony}, ${formData.city}, ${formData.state}, CP ${formData.zipCode}`;
    setFormData({
      ...formData,
      address: fullAddress,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.photos.length < 3) {
      toast.error('Se requieren mínimo 3 fotos');
      return;
    }
    if (formData.workingDays.length === 0) {
      toast.error('Selecciona al menos un día de trabajo');
      return;
    }
    if (!formData.street || !formData.number || !formData.colony) {
      toast.error('Por favor completa todos los campos de la dirección');
      return;
    }
    updateAddress();
    onSubmit(formData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Store className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2">Información Básica</h3>
              <p className="text-primary-600">Comienza con los detalles principales de tu local</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Nombre del Local
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Elegant Cuts Downtown"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Descripción del Local (Opcional)
              </label>
              <textarea
                className="input min-h-[100px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe tu local, servicios especiales, ambiente, etc."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Upload className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2">Fotos del Local</h3>
              <p className="text-primary-600">Muestra tu local con las mejores fotos</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Fotos ({formData.photos.length}/6)
              </label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Local ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.photos.length < 6 && (
                  <label className="border-2 border-dashed border-primary-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <div className="text-center">
                      <Plus className="w-8 h-8 mx-auto text-primary-400" />
                      <span className="text-sm text-primary-600">Agregar fotos</span>
                    </div>
                  </label>
                )}
              </div>
              <p className="text-sm text-primary-500">
                Se requieren al menos 3 fotos del local
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Clock className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2">Horarios de Atención</h3>
              <p className="text-primary-600">Establece tus horarios de servicio</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Hora de Apertura
                </label>
                <input
                  type="time"
                  required
                  className="input"
                  value={formData.openingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, openingTime: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Hora de Cierre
                </label>
                <input
                  type="time"
                  required
                  className="input"
                  value={formData.closingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, closingTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Días Laborales
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DAYS.map((day) => (
                  <label
                    key={day}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-primary-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.workingDays.includes(day)}
                      onChange={(e) => {
                        const days = e.target.checked
                          ? [...formData.workingDays, day]
                          : formData.workingDays.filter((d) => d !== day);
                        setFormData({ ...formData, workingDays: days });
                      }}
                      className="text-primary-600 rounded"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2">Ubicación y Contacto</h3>
              <p className="text-primary-600">¿Dónde pueden encontrarte tus clientes?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Calle
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.street}
                  onChange={(e) => {
                    setFormData({ ...formData, street: e.target.value });
                  }}
                  placeholder="Ej: Av. Insurgentes"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.number}
                  onChange={(e) => {
                    setFormData({ ...formData, number: e.target.value });
                  }}
                  placeholder="Ej: 123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Colonia
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.colony}
                onChange={(e) => {
                  setFormData({ ...formData, colony: e.target.value });
                }}
                placeholder="Ej: Del Valle"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                  }}
                  placeholder="Ej: Monterrey"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Estado
                </label>
                <select
                  required
                  className="input"
                  value={formData.state}
                  onChange={(e) => {
                    setFormData({ ...formData, state: e.target.value });
                  }}
                >
                  <option value="">Selecciona un estado</option>
                  {STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{5}"
                  className="input"
                  value={formData.zipCode}
                  onChange={(e) => {
                    setFormData({ ...formData, zipCode: e.target.value });
                  }}
                  placeholder="Ej: 64000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    className="input pl-10"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-soft-xl p-8 border border-primary-100/10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-1/4 h-2 rounded-full ${
                  index + 1 <= currentStep ? 'bg-primary-600' : 'bg-primary-100'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-primary-600">
            <span>Información</span>
            <span>Fotos</span>
            <span>Horarios</span>
            <span>Ubicación</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={currentStep === 1 ? onCancel : () => setCurrentStep(currentStep - 1)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStep === 1 ? 'Cancelar' : 'Anterior'}</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn btn-primary"
              >
                Siguiente
              </button>
            ) : (
              <button type="submit" className="btn btn-primary">
                {isEdit ? 'Guardar Cambios' : 'Crear Local'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}