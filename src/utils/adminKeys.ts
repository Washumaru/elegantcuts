import { nanoid } from 'nanoid';

interface StoredKey {
  key: string;
  createdAt: number;
  used: boolean;
  usedBy?: string;
}

const ADMIN_KEYS_KEY = 'admin-keys';
const BARBER_KEYS_KEY = 'barber-keys';

// Clear admin keys on page load
window.addEventListener('load', () => {
  localStorage.removeItem(ADMIN_KEYS_KEY);
});

const generateSecureKey = () => nanoid(16).toUpperCase();

const getStoredKeys = (type: 'admin' | 'barber'): StoredKey[] => {
  const storageKey = type === 'admin' ? ADMIN_KEYS_KEY : BARBER_KEYS_KEY;
  const keys = localStorage.getItem(storageKey);
  return keys ? JSON.parse(keys) : [];
};

const saveKeys = (type: 'admin' | 'barber', keys: StoredKey[]) => {
  const storageKey = type === 'admin' ? ADMIN_KEYS_KEY : BARBER_KEYS_KEY;
  localStorage.setItem(storageKey, JSON.stringify(keys));
};

export const generateAdminKey = async () => {
  // Clear any existing admin keys first
  localStorage.removeItem(ADMIN_KEYS_KEY);
  
  const key = `ADM-${generateSecureKey()}-${Date.now()}`;
  const newKey = {
    key,
    createdAt: Date.now(),
    used: false
  };
  
  saveKeys('admin', [newKey]);
  return key;
};

export const generateBarberKey = async () => {
  const key = `BRB-${generateSecureKey()}-${Date.now()}`;
  const keys = getStoredKeys('barber');
  const newKey = {
    key,
    createdAt: Date.now(),
    used: false
  };
  keys.push(newKey);
  saveKeys('barber', keys);
  return key;
};

export const verifyAdminKey = async (key: string): Promise<boolean> => {
  const localKeys = getStoredKeys('admin');
  const localKeyValid = localKeys.some(k => k.key === key && !k.used);
  
  if (localKeyValid) return true;

  try {
    const response = await fetch('/data/admin-keys.json');
    if (!response.ok) return false;
    
    const fileKeys = await response.json();
    const fileKey = fileKeys.find((k: StoredKey) => k.key === key && !k.used);
    
    if (fileKey) {
      saveKeys('admin', [fileKey]);
      return true;
    }
  } catch {
    return false;
  }
  
  return false;
};

export const markAdminKeyAsUsed = async (key: string): Promise<boolean> => {
  localStorage.removeItem(ADMIN_KEYS_KEY);
  
  try {
    const response = await fetch('/data/admin-keys.json');
    if (response.ok) {
      const fileKeys = await response.json();
      if (fileKeys.some((k: StoredKey) => k.key === key)) {
        await fetch('/data/admin-keys.json', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([]),
        });
      }
    }
  } catch {
    // If file update fails, continue since the key is already invalidated in localStorage
  }
  
  return true;
};

export const isValidBarberKey = async (key: string): Promise<boolean> => {
  const keys = getStoredKeys('barber');
  return keys.some(k => k.key === key && !k.used);
};

export const markBarberKeyAsUsed = async (key: string, usedBy: string): Promise<boolean> => {
  const keys = getStoredKeys('barber');
  const keyIndex = keys.findIndex(k => k.key === key && !k.used);
  
  if (keyIndex >= 0) {
    keys[keyIndex].used = true;
    keys[keyIndex].usedBy = usedBy;
    saveKeys('barber', keys);
    return true;
  }
  return false;
};

export const deleteAdminKey = async (key: string): Promise<boolean> => {
  localStorage.removeItem(ADMIN_KEYS_KEY);
  
  try {
    await fetch('/data/admin-keys.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([]),
    });
  } catch {
    // Continue if file update fails since the key is removed from localStorage
  }
  
  return true;
};

export const deleteBarberKey = async (key: string): Promise<boolean> => {
  const keys = getStoredKeys('barber');
  const filteredKeys = keys.filter(k => k.key !== key);
  if (filteredKeys.length !== keys.length) {
    saveKeys('barber', filteredKeys);
    return true;
  }
  return false;
};

export const getAllAdminKeys = async (): Promise<StoredKey[]> => {
  const localKeys = getStoredKeys('admin');
  
  try {
    const response = await fetch('/data/admin-keys.json');
    if (response.ok) {
      const fileKeys = await response.json();
      const unusedFileKeys = fileKeys.filter((k: StoredKey) => !k.used);
      return [...localKeys, ...unusedFileKeys];
    }
  } catch {
    // Return only local keys if file reading fails
  }
  
  return localKeys;
};

export const getAllBarberKeys = async (): Promise<StoredKey[]> => {
  return getStoredKeys('barber');
};