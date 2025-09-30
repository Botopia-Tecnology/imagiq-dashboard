import { PhysicalStore, PickupOrder, StoreStats, StoreAnalytics } from '@/types/physical-stores';

export const mockPhysicalStores: PhysicalStore[] = [
  {
    id: 'store-1',
    code: 'MAD001',
    location: {
      id: 'loc-1',
      name: 'ImagiQ Madrid Centro',
      address: 'Gran Vía, 25',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28013',
      country: 'España',
      latitude: 40.4198,
      longitude: -3.7023
    },
    contact: {
      phone: '+34 91 123 4567',
      email: 'madrid.centro@imagiq.com',
      managerName: 'Ana García',
      managerPhone: '+34 600 111 222'
    },
    hours: [
      { day: 'monday', openTime: '09:00', closeTime: '21:00', isClosed: false },
      { day: 'tuesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
      { day: 'wednesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
      { day: 'thursday', openTime: '09:00', closeTime: '21:00', isClosed: false },
      { day: 'friday', openTime: '09:00', closeTime: '22:00', isClosed: false },
      { day: 'saturday', openTime: '10:00', closeTime: '22:00', isClosed: false },
      { day: 'sunday', openTime: '11:00', closeTime: '20:00', isClosed: false }
    ],
    capabilities: {
      pickupMethods: ['in_store', 'curbside'],
      hasLocker: false,
      hasCurbside: true,
      hasDriveThru: false,
      maxPickupDays: 7,
      maxDailyOrders: 50
    },
    status: 'active',
    inventorySync: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    lastSyncAt: new Date()
  },
  {
    id: 'store-2',
    code: 'BCN001',
    location: {
      id: 'loc-2',
      name: 'ImagiQ Barcelona Passeig de Gràcia',
      address: 'Passeig de Gràcia, 90',
      city: 'Barcelona',
      state: 'Cataluña',
      zipCode: '08008',
      country: 'España',
      latitude: 41.3957,
      longitude: 2.1621
    },
    contact: {
      phone: '+34 93 987 6543',
      email: 'barcelona.gracia@imagiq.com',
      managerName: 'Carlos Martínez',
      managerPhone: '+34 600 333 444'
    },
    hours: [
      { day: 'monday', openTime: '10:00', closeTime: '21:00', isClosed: false },
      { day: 'tuesday', openTime: '10:00', closeTime: '21:00', isClosed: false },
      { day: 'wednesday', openTime: '10:00', closeTime: '21:00', isClosed: false },
      { day: 'thursday', openTime: '10:00', closeTime: '21:00', isClosed: false },
      { day: 'friday', openTime: '10:00', closeTime: '22:00', isClosed: false },
      { day: 'saturday', openTime: '10:00', closeTime: '22:00', isClosed: false },
      { day: 'sunday', openTime: '12:00', closeTime: '20:00', isClosed: false }
    ],
    capabilities: {
      pickupMethods: ['in_store', 'curbside', 'locker'],
      hasLocker: true,
      hasCurbside: true,
      hasDriveThru: false,
      maxPickupDays: 5,
      maxDailyOrders: 75
    },
    status: 'active',
    inventorySync: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    lastSyncAt: new Date()
  },
  {
    id: 'store-3',
    code: 'SEV001',
    location: {
      id: 'loc-3',
      name: 'ImagiQ Sevilla Centro Comercial',
      address: 'Av. de la Constitución, 18',
      city: 'Sevilla',
      state: 'Andalucía',
      zipCode: '41004',
      country: 'España',
      latitude: 37.3886,
      longitude: -5.9823
    },
    contact: {
      phone: '+34 95 555 6789',
      email: 'sevilla.centro@imagiq.com',
      managerName: 'Isabel Ruiz',
      managerPhone: '+34 600 555 666'
    },
    hours: [
      { day: 'monday', openTime: '10:00', closeTime: '22:00', isClosed: false },
      { day: 'tuesday', openTime: '10:00', closeTime: '22:00', isClosed: false },
      { day: 'wednesday', openTime: '10:00', closeTime: '22:00', isClosed: false },
      { day: 'thursday', openTime: '10:00', closeTime: '22:00', isClosed: false },
      { day: 'friday', openTime: '10:00', closeTime: '23:00', isClosed: false },
      { day: 'saturday', openTime: '10:00', closeTime: '23:00', isClosed: false },
      { day: 'sunday', openTime: '12:00', closeTime: '21:00', isClosed: false }
    ],
    capabilities: {
      pickupMethods: ['in_store', 'drive_thru'],
      hasLocker: false,
      hasCurbside: false,
      hasDriveThru: true,
      maxPickupDays: 3,
      maxDailyOrders: 30
    },
    status: 'active',
    inventorySync: true,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date(),
    lastSyncAt: new Date()
  },
  {
    id: 'store-4',
    code: 'VAL001',
    location: {
      id: 'loc-4',
      name: 'ImagiQ Valencia Puerto',
      address: 'Calle Colón, 42',
      city: 'Valencia',
      state: 'Valencia',
      zipCode: '46004',
      country: 'España',
      latitude: 39.4715,
      longitude: -0.3774
    },
    contact: {
      phone: '+34 96 777 8899',
      email: 'valencia.puerto@imagiq.com',
      managerName: 'Miguel Torres',
      managerPhone: '+34 600 777 888'
    },
    hours: [
      { day: 'monday', openTime: '09:30', closeTime: '21:30', isClosed: false },
      { day: 'tuesday', openTime: '09:30', closeTime: '21:30', isClosed: false },
      { day: 'wednesday', openTime: '09:30', closeTime: '21:30', isClosed: false },
      { day: 'thursday', openTime: '09:30', closeTime: '21:30', isClosed: false },
      { day: 'friday', openTime: '09:30', closeTime: '22:30', isClosed: false },
      { day: 'saturday', openTime: '10:00', closeTime: '22:30', isClosed: false },
      { day: 'sunday', openTime: '00:00', closeTime: '00:00', isClosed: true }
    ],
    capabilities: {
      pickupMethods: ['in_store'],
      hasLocker: false,
      hasCurbside: false,
      hasDriveThru: false,
      maxPickupDays: 5,
      maxDailyOrders: 25
    },
    status: 'maintenance',
    inventorySync: false,
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date(),
    lastSyncAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
];

export const mockStoreStats: Record<string, StoreStats> = {
  'store-1': {
    totalOrders: 234,
    readyOrders: 8,
    completedToday: 12,
    pendingOrders: 5,
    expiredOrders: 2,
    averagePickupTime: 4.2,
    customerSatisfaction: 4.7,
    conversionRate: 94.2
  },
  'store-2': {
    totalOrders: 189,
    readyOrders: 6,
    completedToday: 15,
    pendingOrders: 3,
    expiredOrders: 1,
    averagePickupTime: 3.8,
    customerSatisfaction: 4.8,
    conversionRate: 96.1
  },
  'store-3': {
    totalOrders: 156,
    readyOrders: 4,
    completedToday: 8,
    pendingOrders: 7,
    expiredOrders: 3,
    averagePickupTime: 5.1,
    customerSatisfaction: 4.5,
    conversionRate: 89.7
  },
  'store-4': {
    totalOrders: 67,
    readyOrders: 0,
    completedToday: 0,
    pendingOrders: 2,
    expiredOrders: 5,
    averagePickupTime: 6.2,
    customerSatisfaction: 4.2,
    conversionRate: 78.3
  }
};

export const mockStoreAnalytics: StoreAnalytics[] = [
  {
    date: '2024-01-20',
    storeId: 'store-1',
    ordersReceived: 15,
    ordersCompleted: 14,
    averageWaitTime: 4.2,
    customerRating: 4.7,
    revenue: 2890.50,
    cancelationRate: 6.7
  },
  {
    date: '2024-01-20',
    storeId: 'store-2',
    ordersReceived: 18,
    ordersCompleted: 17,
    averageWaitTime: 3.8,
    customerRating: 4.8,
    revenue: 3240.75,
    cancelationRate: 5.6
  },
  {
    date: '2024-01-20',
    storeId: 'store-3',
    ordersReceived: 12,
    ordersCompleted: 10,
    averageWaitTime: 5.1,
    customerRating: 4.5,
    revenue: 1850.25,
    cancelationRate: 16.7
  },
  {
    date: '2024-01-20',
    storeId: 'store-4',
    ordersReceived: 0,
    ordersCompleted: 0,
    averageWaitTime: 0,
    customerRating: 0,
    revenue: 0,
    cancelationRate: 0
  }
];

export const getStoreStats = (storeId: string): StoreStats => {
  return mockStoreStats[storeId] || {
    totalOrders: 0,
    readyOrders: 0,
    completedToday: 0,
    pendingOrders: 0,
    expiredOrders: 0,
    averagePickupTime: 0,
    customerSatisfaction: 0,
    conversionRate: 0
  };
};

export const getStoreAnalytics = (storeId: string, days: number = 7): StoreAnalytics[] => {
  return mockStoreAnalytics.filter(analytics => analytics.storeId === storeId);
};