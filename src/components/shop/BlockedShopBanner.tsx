import { AlertTriangle, Mail } from 'lucide-react';

export default function BlockedShopBanner() {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <AlertTriangle className="w-6 h-6 text-red-500 mr-4 flex-shrink-0 mt-1" />
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium text-red-800">Local Bloqueado por Administración</h3>
            <p className="mt-2 text-red-700">
              Este local ha sido bloqueado temporalmente por el administrador del sistema. Todas las operaciones están restringidas hasta que se resuelva esta situación.
            </p>
          </div>
          
          <div className="bg-white bg-opacity-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-red-800 mb-2">¿Qué significa esto?</h4>
            <ul className="list-disc list-inside space-y-2 text-red-700">
              <li>No se pueden agendar nuevas citas</li>
              <li>No se pueden modificar los horarios</li>
              <li>No se pueden realizar cambios en la información del local</li>
              <li>No se pueden gestionar los barberos</li>
            </ul>
          </div>

          <div className="bg-white bg-opacity-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-red-800 mb-2">¿Qué debo hacer?</h4>
            <div className="space-y-2 text-red-700">
              <p>Por favor, contacta inmediatamente con el administrador del sistema para:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Conocer el motivo del bloqueo</li>
                <li>Recibir instrucciones sobre cómo proceder</li>
                <li>Resolver cualquier problema pendiente</li>
              </ul>
            </div>
            <div className="mt-4 flex items-center text-red-800">
              <Mail className="w-5 h-5 mr-2" />
              <span>Contacto: admin@elegantcuts.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}