export interface Shop {
  id: string;
  name: string;
  description?: string;
  photos: string[];
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  address: string;
  street: string;
  number: string;
  colony: string;
  joinCode: string;
  ownerId: string;
  barberIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  availableTimeSlots?: Array<{
    time: string;
    duration: number;
  }>;
  location?: {
    latitude: number;
    longitude: number;
  };
}