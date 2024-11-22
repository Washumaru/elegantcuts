import { nanoid } from 'nanoid';
import { toast } from 'react-hot-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'barber' | 'client';
  barberKey?: string;
  status: 'active' | 'blocked';
  createdAt: string;
  lastLogin?: string;
}

const DB_KEY = 'elegant-cuts-db';

class LocalDatabase {
  private users: User[] = [];
  private dbViewer: Window | null = null;

  constructor() {
    this.loadFromStorage();
    this.openDatabaseViewer();
  }

  private openDatabaseViewer() {
    // Abrir la ventana de visualización de la base de datos
    if (!this.dbViewer || this.dbViewer.closed) {
      this.dbViewer = window.open('/basededatostemporal.html', 'dbViewer', 'width=800,height=600');
    }
  }

  private loadFromStorage() {
    const data = localStorage.getItem(DB_KEY);
    if (data) {
      this.users = JSON.parse(data);
    }
  }

  private saveToStorage() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.users));
    // Intentar actualizar la visualización si la ventana está abierta
    if (this.dbViewer && !this.dbViewer.closed) {
      this.dbViewer.location.reload();
    }
  }

  createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'client' | 'barber';
    barberKey?: string;
  }): User {
    if (this.users.some(u => u.email === userData.email)) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const newUser: User = {
      id: nanoid(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      barberKey: userData.barberKey,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  login(email: string, password: string): User {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (user.status === 'blocked') {
      throw new Error('Usuario bloqueado. Contacte al administrador');
    }

    user.lastLogin = new Date().toISOString();
    this.saveToStorage();
    return user;
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  getUsersByRole(role: User['role']): User[] {
    return this.users.filter(u => u.role === role);
  }

  searchUsers(query: string): User[] {
    const searchTerm = query.toLowerCase();
    return this.users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }

  updateUser(userId: string, updates: Partial<User>): User {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const { id, ...validUpdates } = updates;
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...validUpdates,
    };

    this.saveToStorage();
    return this.users[userIndex];
  }

  deleteUser(userId: string): void {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    this.users.splice(userIndex, 1);
    this.saveToStorage();
  }

  blockUser(userId: string): User {
    return this.updateUser(userId, { status: 'blocked' });
  }

  unblockUser(userId: string): User {
    return this.updateUser(userId, { status: 'active' });
  }

  getUserStats() {
    return {
      total: this.users.length,
      active: this.users.filter(u => u.status === 'active').length,
      blocked: this.users.filter(u => u.status === 'blocked').length,
      admins: this.users.filter(u => u.role === 'admin').length,
      barbers: this.users.filter(u => u.role === 'barber').length,
      clients: this.users.filter(u => u.role === 'client').length,
    };
  }

  clearDatabase() {
    this.users = [];
    this.saveToStorage();
  }
}

export const localDB = new LocalDatabase();