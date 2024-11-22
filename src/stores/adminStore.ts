import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateAdminKey, generateBarberKey } from '../utils/adminKeys';

interface BarberKey {
  key: string;
  createdAt: number;
  used: boolean;
  usedBy?: string;
}

interface AdminStore {
  barberKeys: BarberKey[];
  generateNewBarberKey: () => string;
  markBarberKeyAsUsed: (key: string, usedBy: string) => void;
  isBarberKeyValid: (key: string) => boolean;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      barberKeys: [],
      generateNewBarberKey: () => {
        const newKey = generateBarberKey();
        set((state) => ({
          barberKeys: [
            ...state.barberKeys,
            {
              key: newKey,
              createdAt: Date.now(),
              used: false,
            },
          ],
        }));
        return newKey;
      },
      markBarberKeyAsUsed: (key: string, usedBy: string) => {
        set((state) => ({
          barberKeys: state.barberKeys.map((k) =>
            k.key === key ? { ...k, used: true, usedBy } : k
          ),
        }));
      },
      isBarberKeyValid: (key: string) => {
        const keys = get().barberKeys;
        const foundKey = keys.find((k) => k.key === key);
        return foundKey ? !foundKey.used : false;
      },
    }),
    {
      name: 'admin-storage',
    }
  )
);