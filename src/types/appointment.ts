export interface Appointment {
  id: string;
  shopId: string;
  shopName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  barberId?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}