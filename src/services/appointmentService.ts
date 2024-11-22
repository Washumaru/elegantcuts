import { nanoid } from 'nanoid';
import { Appointment } from '../types/appointment';
import { Shop } from '../types/shop';
import { localDB } from './localDatabase';
import toast from 'react-hot-toast';

const APPOINTMENTS_KEY = 'elegant-cuts-appointments';

class AppointmentService {
  private getAppointments(): Appointment[] {
    const data = localStorage.getItem(APPOINTMENTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveAppointments(appointments: Appointment[]) {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  }

  getAppointmentById(appointmentId: string): Appointment | null {
    const appointments = this.getAppointments();
    return appointments.find(apt => apt.id === appointmentId) || null;
  }

  isTimeSlotAvailable(shopId: string, date: string, time: string, barberId?: string): boolean {
    const appointments = this.getAppointments();
    return !appointments.some(
      apt =>
        apt.shopId === shopId &&
        apt.date === date &&
        apt.time === time &&
        apt.status !== 'cancelled' &&
        (!barberId || apt.barberId === barberId)
    );
  }

  getBarberName(barberId: string): string {
    const barber = localDB.getAllUsers().find(user => user.id === barberId);
    return barber?.name || 'Barbero no encontrado';
  }

  getClientAppointments(clientId: string): Appointment[] {
    return this.getAppointments()
      .filter(apt => apt.clientId === clientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getShopAppointments(shopId: string): Appointment[] {
    return this.getAppointments()
      .filter(apt => apt.shopId === shopId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getBarberAppointments(barberId: string, shopId?: string): Appointment[] {
    const appointments = this.getAppointments();
    const shop = shopId ? this.getShopById(shopId) : null;
    
    return appointments
      .filter(apt => {
        if (apt.barberId) {
          return apt.barberId === barberId;
        }
        if (shop && shop.barberIds.includes(barberId)) {
          return apt.shopId === shopId;
        }
        return false;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getShopNameById(shopId: string): string {
    const shops = JSON.parse(localStorage.getItem('elegant-cuts-shops') || '[]');
    const shop = shops.find((s: Shop) => s.id === shopId);
    return shop ? shop.name : 'Local no encontrado';
  }

  calculateTimeRemaining(date: string, time: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const [appointmentHours, appointmentMinutes] = time.split(':').map(Number);
    const appointmentDate = new Date(year, month - 1, day, appointmentHours, appointmentMinutes);
    const now = new Date();
    const diff = appointmentDate.getTime() - now.getTime();

    if (diff < 0) return 'Cita pasada';

    const totalMinutes = Math.floor(diff / (1000 * 60));
    const remainingDays = Math.floor(totalMinutes / (60 * 24));
    const remainingHours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const remainingMinutes = totalMinutes % 60;

    if (remainingDays > 0) return `${remainingDays} días`;
    if (remainingHours > 0) return `${remainingHours} horas`;
    return `${remainingMinutes} minutos`;
  }

  createAppointment(data: {
    shopId: string;
    clientId: string;
    clientName: string;
    clientPhone: string;
    date: string;
    time: string;
    barberId?: string;
  }): Appointment {
    if (!this.isTimeSlotAvailable(data.shopId, data.date, data.time, data.barberId)) {
      throw new Error('Este horario ya está ocupado');
    }

    const appointment: Appointment = {
      id: `APT-${nanoid(8)}`,
      ...data,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      shopName: this.getShopNameById(data.shopId)
    };

    const appointments = this.getAppointments();
    appointments.push(appointment);
    this.saveAppointments(appointments);

    return appointment;
  }

  updateAppointment(appointmentId: string, updates: Partial<Appointment>): Appointment {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(apt => apt.id === appointmentId);

    if (index === -1) {
      throw new Error('Cita no encontrada');
    }

    if ((updates.date || updates.time) && appointments[index].status !== 'cancelled') {
      const date = updates.date || appointments[index].date;
      const time = updates.time || appointments[index].time;
      
      if (!this.isTimeSlotAvailable(
        appointments[index].shopId,
        date,
        time,
        appointments[index].barberId
      )) {
        throw new Error('El nuevo horario ya está ocupado');
      }
    }

    appointments[index] = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveAppointments(appointments);
    return appointments[index];
  }

  updateAppointmentStatus(
    appointmentId: string,
    status: Appointment['status']
  ): Appointment {
    return this.updateAppointment(appointmentId, { status });
  }

  deleteAppointment(appointmentId: string): void {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(apt => apt.id === appointmentId);

    if (index === -1) {
      throw new Error('Cita no encontrada');
    }

    appointments.splice(index, 1);
    this.saveAppointments(appointments);
  }

  getBarberAvailability(barberId: string, date: string, shopId: string): string[] {
    const shop = this.getShopById(shopId);
    if (!shop) return [];

    if (shop.availableTimeSlots && shop.availableTimeSlots.length > 0) {
      return shop.availableTimeSlots
        .map(slot => slot.time)
        .filter(time => this.isTimeSlotAvailable(shopId, date, time, barberId));
    }

    const appointments = this.getBarberAppointments(barberId, shopId)
      .filter(apt => apt.date === date && apt.status !== 'cancelled');
    
    const bookedTimes = new Set(appointments.map(apt => apt.time));
    const availableTimes: string[] = [];
    
    const [openHour, openMinute] = shop.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = shop.closingTime.split(':').map(Number);
    
    let currentTime = openHour * 60 + openMinute;
    const endTime = closeHour * 60 + closeMinute;

    while (currentTime < endTime) {
      const hour = Math.floor(currentTime / 60);
      const minute = currentTime % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      if (!bookedTimes.has(timeString)) {
        availableTimes.push(timeString);
      }

      currentTime += 60;
    }

    return availableTimes;
  }

  private getShopById(shopId: string): Shop | null {
    const shops = JSON.parse(localStorage.getItem('elegant-cuts-shops') || '[]');
    return shops.find((s: Shop) => s.id === shopId) || null;
  }
}

export const appointmentService = new AppointmentService();