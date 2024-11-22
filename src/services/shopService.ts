import { nanoid } from 'nanoid';
import { Shop } from '../types/shop';
import { ShopFormData } from '../components/shop/ShopForm';
import { notificationService } from './notificationService';
import { localDB } from './localDatabase';
import toast from 'react-hot-toast';

const SHOPS_KEY = 'elegant-cuts-shops';

class ShopService {
  private shops: Shop[] = [];

  constructor() {
    this.loadShops();
  }

  private loadShops(): void {
    const data = localStorage.getItem(SHOPS_KEY);
    this.shops = data ? JSON.parse(data) : [];
  }

  private saveShops(): void {
    localStorage.setItem(SHOPS_KEY, JSON.stringify(this.shops));
  }

  getShops(): Shop[] {
    return [...this.shops];
  }

  getShopById(shopId: string): Shop | null {
    return this.shops.find(s => s.id === shopId) || null;
  }

  getShopByBarber(barberId: string): Shop | null {
    return this.shops.find(s => s.barberIds.includes(barberId)) || null;
  }

  getBarberById(barberId: string) {
    const barber = localDB.getAllUsers().find(user => user.id === barberId);
    return barber ? {
      id: barber.id,
      name: barber.name,
      email: barber.email
    } : null;
  }

  createShop(data: ShopFormData, ownerId: string): Shop {
    const newShop: Shop = {
      id: nanoid(),
      ...data,
      ownerId,
      barberIds: [ownerId],
      isActive: true,
      joinCode: nanoid(8).toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.shops.push(newShop);
    this.saveShops();
    return newShop;
  }

  updateShop(shopId: string, data: Partial<Shop>): Shop {
    const index = this.shops.findIndex(s => s.id === shopId);
    
    if (index === -1) {
      throw new Error('Local no encontrado');
    }

    this.shops[index] = {
      ...this.shops[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.saveShops();
    return this.shops[index];
  }

  deleteShop(shopId: string, userId: string, reason?: string): void {
    const shop = this.shops.find(s => s.id === shopId);
    
    if (!shop) {
      throw new Error('Local no encontrado');
    }

    if (userId !== 'admin' && shop.ownerId !== userId) {
      throw new Error('No tienes permiso para eliminar este local');
    }

    shop.barberIds.forEach(barberId => {
      if (barberId !== userId) {
        notificationService.createNotification({
          type: 'shop_delete',
          message: `El local "${shop.name}" ha sido eliminado${reason ? `. Motivo: ${reason}` : ''}`,
          userId: barberId,
          shopId: shop.id,
          shopName: shop.name,
          reason: reason
        });
      }
    });

    this.shops = this.shops.filter(s => s.id !== shopId);
    this.saveShops();
  }

  joinShop(joinCode: string, barberId: string, barberName: string): Shop {
    const shop = this.shops.find(s => s.joinCode === joinCode);
    
    if (!shop) {
      throw new Error('Código de unión inválido');
    }

    if (shop.barberIds.includes(barberId)) {
      throw new Error('Ya eres parte de este local');
    }

    const index = this.shops.findIndex(s => s.id === shop.id);
    this.shops[index].barberIds.push(barberId);
    this.shops[index].updatedAt = new Date().toISOString();

    notificationService.createNotification({
      type: 'barber_join',
      message: `${barberName} se ha unido al local`,
      userId: shop.ownerId,
      shopId: shop.id,
      barberId,
      barberName
    });

    this.saveShops();
    return this.shops[index];
  }

  leaveShop(shopId: string, barberId: string, barberName: string): void {
    const shop = this.shops.find(s => s.id === shopId);
    
    if (!shop) {
      throw new Error('Local no encontrado');
    }

    if (shop.ownerId === barberId) {
      throw new Error('El dueño no puede abandonar el local');
    }

    if (!shop.barberIds.includes(barberId)) {
      throw new Error('No eres parte de este local');
    }

    const index = this.shops.findIndex(s => s.id === shopId);
    this.shops[index].barberIds = this.shops[index].barberIds.filter(id => id !== barberId);
    this.shops[index].updatedAt = new Date().toISOString();

    notificationService.createNotification({
      type: 'barber_leave',
      message: `${barberName} ha dejado el local`,
      userId: shop.ownerId,
      shopId: shop.id,
      barberId,
      barberName
    });

    this.saveShops();
  }

  transferOwnership(shopId: string, newOwnerId: string, currentOwnerName: string, newOwnerName: string): void {
    const index = this.shops.findIndex(s => s.id === shopId);
    
    if (index === -1) {
      throw new Error('Local no encontrado');
    }

    const oldOwnerId = this.shops[index].ownerId;
    this.shops[index].ownerId = newOwnerId;
    this.shops[index].updatedAt = new Date().toISOString();

    notificationService.createNotification({
      type: 'shop_owner',
      message: `Has recibido la propiedad del local de ${currentOwnerName}`,
      userId: newOwnerId,
      shopId: shopId,
      previousOwnerName: currentOwnerName
    });

    this.saveShops();
  }
}

export const shopService = new ShopService();