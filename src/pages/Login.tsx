import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scissors, Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import * as authService from '../services/auth';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Dirección de correo electrónico no válida'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data.email, data.password);
      setAuth(response.user, response.token);
      toast.success('¡Iniciado sesión exitosamente!');
      navigate('/elegantcuts/dashboard');
    } catch (error) {
      // Error handling is done in the service
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
            ¡Bienvenido de nuevo!
          </h1>
          <p className="text-primary-600">
            Inicia sesión para gestionar tus citas
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-soft-xl p-8 space-y-6 border border-primary-100/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-primary-700 mb-1"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary-700 mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full py-3 flex items-center justify-center space-x-2 text-lg"
              disabled={isLoading}
            >
              <LogIn className="w-5 h-5" />
              <span>{isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-primary-500">
                ¿No tienes una cuenta?
              </span>
            </div>
          </div>

          <div className="text-center space-y-4">
            <Link
              to="/elegantcuts/register"
              className="btn btn-secondary w-full py-3 flex items-center justify-center space-x-2"
            >
              <span>Crear Cuenta</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}