export interface Notification {
  id: string;
  type: 'appointment_cancel' | 'barber_join' | 'barber_leave' | 'shop_delete' | 'shop_owner';
  message: string;
  timestamp: string;
  read: boolean;
  userId: string;
  shopId?: string;
  barberId?: string;
  appointmentId?: string;
  reason?: string;
  previousOwnerName?: string;
  barberName?: string;
  shopName?: string;
}

export interface AppointmentCancelNotification extends Notification {
  type: 'appointment_cancel';
  appointmentId: string;
  reason: string;
}

export interface BarberJoinNotification extends Notification {
  type: 'barber_join';
  shopId: string;
  barberId: string;
  barberName: string;
}

export interface BarberLeaveNotification extends Notification {
  type: 'barber_leave';
  shopId: string;
  barberId: string;
  barberName: string;
}

export interface ShopDeleteNotification extends Notification {
  type: 'shop_delete';
  shopId: string;
  shopName: string;
  reason?: string;
}

export interface ShopOwnerNotification extends Notification {
  type: 'shop_owner';
  shopId: string;
  previousOwnerName: string;
}