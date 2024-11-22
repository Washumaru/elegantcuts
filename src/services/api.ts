import { apiClient } from '../lib/db';

// Barbers API
export const barbersApi = {
  getAll: async () => {
    const response = await apiClient.get('/barbers');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await apiClient.get(`/barbers/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await apiClient.post('/barbers', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/barbers/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await apiClient.delete(`/barbers/${id}`);
    return response.data;
  }
};

// Clients API
export const clientsApi = {
  getAll: async () => {
    const response = await apiClient.get('/clients');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await apiClient.post('/clients', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/clients/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  }
};