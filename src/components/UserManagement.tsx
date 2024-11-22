import { useState } from 'react';
import { User, Edit, UserX, UserCheck, Trash2, Search, Info } from 'lucide-react';
import { localDB, User as UserType } from '../services/localDatabase';
import toast from 'react-hot-toast';

interface EditUserData {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface UserDetailsModalProps {
  user: UserType;
  onClose: () => void;
}

function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif">Detalles del Usuario</h2>
          <button
            onClick={onClose}
            className="text-primary-600 hover:text-primary-800"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-primary-700 mb-2">Información Básica</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-primary-600">Nombre</label>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm text-primary-600">Email</label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-primary-600">ID</label>
                  <p className="font-mono text-sm bg-primary-50 p-1 rounded">{user.id}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-primary-700 mb-2">Estado y Rol</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-primary-600">Rol</label>
                  <p>
                    <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'barber' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-primary-600">Estado</label>
                  <p>
                    <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-primary-700 mb-2">Información Temporal</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-primary-600">Fecha de Registro</label>
                <p className="font-medium">{formatDateTime(user.createdAt)}</p>
              </div>
              {user.lastLogin && (
                <div>
                  <label className="text-sm text-primary-600">Último Acceso</label>
                  <p className="font-medium">{formatDateTime(user.lastLogin)}</p>
                </div>
              )}
            </div>
          </div>

          {user.role === 'barber' && user.barberKey && (
            <div>
              <h3 className="font-medium text-primary-700 mb-2">Información de Barbero</h3>
              <div>
                <label className="text-sm text-primary-600">Clave de Registro</label>
                <p className="font-mono text-sm bg-primary-50 p-2 rounded">{user.barberKey}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>(localDB.getAllUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | UserType['role']>('all');
  const [editingUser, setEditingUser] = useState<EditUserData | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      const results = localDB.searchUsers(term);
      setUsers(selectedRole === 'all' ? results : results.filter(u => u.role === selectedRole));
    } else {
      loadUsers();
    }
  };

  const loadUsers = () => {
    setUsers(selectedRole === 'all' ? localDB.getAllUsers() : localDB.getUsersByRole(selectedRole));
  };

  const handleRoleFilter = (role: 'all' | UserType['role']) => {
    setSelectedRole(role);
    setUsers(role === 'all' ? localDB.getAllUsers() : localDB.getUsersByRole(role));
  };

  const handleUpdateUser = (userId: string, updates: Partial<UserType>) => {
    try {
      localDB.updateUser(userId, updates);
      loadUsers();
      toast.success('Usuario actualizado correctamente');
      setEditingUser(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        localDB.deleteUser(userId);
        loadUsers();
        toast.success('Usuario eliminado correctamente');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleBlockUser = (userId: string, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        localDB.unblockUser(userId);
        toast.success('Usuario desbloqueado');
      } else {
        localDB.blockUser(userId);
        toast.success('Usuario bloqueado');
      }
      loadUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            className={`btn ${selectedRole === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRoleFilter('all')}
          >
            Todos
          </button>
          <button
            className={`btn ${selectedRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRoleFilter('admin')}
          >
            Admins
          </button>
          <button
            className={`btn ${selectedRole === 'barber' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRoleFilter('barber')}
          >
            Barberos
          </button>
          <button
            className={`btn ${selectedRole === 'client' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRoleFilter('client')}
          >
            Clientes
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="card p-4">
            {editingUser?.id === user.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  className="input"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Nombre"
                />
                <input
                  type="email"
                  className="input"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="Email"
                />
                <input
                  type="password"
                  className="input"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="Contraseña"
                />
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpdateUser(user.id, editingUser)}
                  >
                    Guardar
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-primary-600">{user.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'barber' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedUser(user)}
                    title="Ver detalles"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditingUser({
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      password: user.password,
                    })}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className={`btn ${user.status === 'blocked' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleBlockUser(user.id, user.status === 'blocked')}
                  >
                    {user.status === 'blocked' ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <UserX className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="btn btn-secondary text-red-500"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}