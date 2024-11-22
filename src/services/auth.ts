import { localDB } from './localDatabase';
import { toast } from 'react-hot-toast';

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'barber' | 'client';
  };
  token: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'barber';
  barberKey?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const user = localDB.login(email, password);
    const token = `token-${user.id}`; // Simplified token for local storage
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  } catch (error: any) {
    toast.error(error.message || 'Error al iniciar sesión');
    throw error;
  }
}

export async function register(data: RegisterData): Promise<LoginResponse> {
  try {
    const user = localDB.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      barberKey: data.barberKey
    });

    const token = `token-${user.id}`; // Simplified token for local storage
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  } catch (error: any) {
    toast.error(error.message || 'Error en el registro');
    throw error;
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem('auth-storage');
}