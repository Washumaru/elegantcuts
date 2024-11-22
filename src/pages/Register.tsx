import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scissors, Mail, Lock, User, Key, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { isValidBarberKey, markBarberKeyAsUsed } from '../utils/adminKeys';
import { register as registerUser } from '../services/auth';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['client', 'barber']),
    barberKey: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'barber') {
        if (!data.barberKey) return false;
        return isValidBarberKey(data.barberKey);
      }
      return true;
    },
    {
      message: 'Se requiere una clave de barbero válida para registrarse como barbero.',
      path: ['barberKey'],
    }
  );

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'client',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      if (data.role === 'barber' && data.barberKey) {
        markBarberKeyAsUsed(data.barberKey, data.email);
      }

      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        barberKey: data.barberKey,
      });
      
      toast.success('¡Registro exitoso! Por favor inicia sesión.');
      navigate('/elegantcuts/login');
    } catch (error) {
      toast.error('El registro falló. Por favor inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-soft-xl">
              <Scissors className="w-12 h-12 text-primary-600 transform hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <h1 className="font-serif text-4xl text-primary-900 mb-2">
            Crear Cuenta
          </h1>
          <p className="text-primary-600">
            Únete a nuestra comunidad
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-soft-xl p-8 space-y-6 border border-primary-100/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <label className="relative flex items-center p-4 rounded-lg border border-primary-200 cursor-pointer hover:border-primary-300 transition-colors">
                <input
                  type="radio"
                  value="client"
                  {...register('role')}
                  className="hidden"
                />
                <div className={`w-full text-center ${selectedRole === 'client' ? 'text-primary-600' : 'text-primary-400'}`}>
                  <User className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Cliente</span>
                </div>
                {selectedRole === 'client' && (
                  <div className="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none"></div>
                )}
              </label>
              <label className="relative flex items-center p-4 rounded-lg border border-primary-200 cursor-pointer hover:border-primary-300 transition-colors">
                <input
                  type="radio"
                  value="barber"
                  {...register('role')}
                  className="hidden"
                />
                <div className={`w-full text-center ${selectedRole === 'barber' ? 'text-primary-600' : 'text-primary-400'}`}>
                  <Scissors className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Barbero</span>
                </div>
                {selectedRole === 'barber' && (
                  <div className="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none"></div>
                )}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
                <input
                  type="text"
                  {...register('name')}
                  className="input pl-10"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
                <input
                  type="email"
                  {...register('email')}
                  className="input pl-10"
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
                <input
                  type="password"
                  {...register('password')}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {selectedRole === 'barber' && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Clave de Barbero
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
                  <input
                    type="text"
                    {...register('barberKey')}
                    className="input pl-10"
                    placeholder="Ingresa tu clave de barbero"
                  />
                </div>
                {errors.barberKey && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.barberKey.message}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full py-3 flex items-center justify-center space-x-2 text-lg"
              disabled={isLoading}
            >
              <UserPlus className="w-5 h-5" />
              <span>{isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}</span>
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-primary-500">
                ¿Ya tienes una cuenta?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/elegantcuts/login"
              className="btn btn-secondary w-full py-3 flex items-center justify-center space-x-2"
            >
              <span>Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}