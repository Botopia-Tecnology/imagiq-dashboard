import { User, UserActivity, UserStats, UserRole, Permission } from '@/types/users';

// Role permissions mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete',
    'analytics.read', 'settings.read', 'settings.update',
    'products.create', 'products.read', 'products.update', 'products.delete',
    'orders.read', 'orders.update', 'customers.read', 'customers.update'
  ],
  admin: [
    'users.read', 'users.update',
    'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete',
    'analytics.read', 'settings.read',
    'products.create', 'products.read', 'products.update', 'products.delete',
    'orders.read', 'orders.update', 'customers.read', 'customers.update'
  ],
  manager: [
    'users.read',
    'campaigns.create', 'campaigns.read', 'campaigns.update',
    'analytics.read',
    'products.read', 'products.update',
    'orders.read', 'orders.update', 'customers.read', 'customers.update'
  ],
  editor: [
    'campaigns.create', 'campaigns.read', 'campaigns.update',
    'products.create', 'products.read', 'products.update',
    'customers.read'
  ],
  viewer: [
    'campaigns.read', 'analytics.read', 'products.read', 'orders.read', 'customers.read'
  ]
};

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@imagiq.com',
    name: 'David García',
    avatar: undefined,
    role: 'super_admin',
    permissions: rolePermissions.super_admin,
    status: 'active',
    lastLogin: new Date('2024-01-15T10:30:00'),
    createdAt: new Date('2023-01-15T09:00:00'),
    updatedAt: new Date('2024-01-15T10:30:00'),
    createdBy: 'system',
    department: 'Tecnología',
    phoneNumber: '+34 600 123 456',
    location: 'Madrid, España',
    timezone: 'Europe/Madrid',
    twoFactorEnabled: true,
    loginAttempts: 0,
    lastActivity: new Date('2024-01-15T14:45:00')
  },
  {
    id: '2',
    email: 'marketing@imagiq.com',
    name: 'Ana Martínez',
    avatar: undefined,
    role: 'admin',
    permissions: rolePermissions.admin,
    status: 'active',
    lastLogin: new Date('2024-01-15T09:15:00'),
    createdAt: new Date('2023-02-20T10:00:00'),
    updatedAt: new Date('2024-01-15T09:15:00'),
    createdBy: '1',
    department: 'Marketing',
    phoneNumber: '+34 600 789 012',
    location: 'Barcelona, España',
    timezone: 'Europe/Madrid',
    twoFactorEnabled: true,
    loginAttempts: 0,
    lastActivity: new Date('2024-01-15T13:20:00')
  },
  {
    id: '3',
    email: 'sales@imagiq.com',
    name: 'Carlos López',
    avatar: undefined,
    role: 'manager',
    permissions: rolePermissions.manager,
    status: 'active',
    lastLogin: new Date('2024-01-14T16:45:00'),
    createdAt: new Date('2023-03-10T11:30:00'),
    updatedAt: new Date('2024-01-14T16:45:00'),
    createdBy: '1',
    department: 'Ventas',
    phoneNumber: '+34 600 345 678',
    location: 'Valencia, España',
    timezone: 'Europe/Madrid',
    twoFactorEnabled: false,
    loginAttempts: 0,
    lastActivity: new Date('2024-01-14T17:30:00')
  },
  {
    id: '4',
    email: 'content@imagiq.com',
    name: 'Laura Fernández',
    avatar: undefined,
    role: 'editor',
    permissions: rolePermissions.editor,
    status: 'active',
    lastLogin: new Date('2024-01-15T08:30:00'),
    createdAt: new Date('2023-04-05T14:00:00'),
    updatedAt: new Date('2024-01-15T08:30:00'),
    createdBy: '2',
    department: 'Contenido',
    phoneNumber: '+34 600 567 890',
    location: 'Sevilla, España',
    timezone: 'Europe/Madrid',
    twoFactorEnabled: true,
    loginAttempts: 0,
    lastActivity: new Date('2024-01-15T12:15:00')
  },
  {
    id: '5',
    email: 'intern@imagiq.com',
    name: 'Miguel Rodríguez',
    avatar: undefined,
    role: 'viewer',
    permissions: rolePermissions.viewer,
    status: 'active',
    lastLogin: new Date('2024-01-15T07:45:00'),
    createdAt: new Date('2023-10-01T09:00:00'),
    updatedAt: new Date('2024-01-15T07:45:00'),
    createdBy: '3',
    department: 'Prácticas',
    phoneNumber: '+34 600 901 234',
    location: 'Bilbao, España',
    timezone: 'Europe/Madrid',
    twoFactorEnabled: false,
    loginAttempts: 0,
    lastActivity: new Date('2024-01-15T11:30:00')
  },
  {
    id: '6',
    email: 'designer@imagiq.com',
    name: 'Sofia Morales',
    avatar: undefined,
    role: 'editor',
    permissions: rolePermissions.editor,
    status: 'inactive',
    lastLogin: new Date('2024-01-10T15:20:00'),
    createdAt: new Date('2023-06-15T10:30:00'),
    updatedAt: new Date('2024-01-10T15:20:00'),
    createdBy: '2',
    department: 'Diseño',
    phoneNumber: '+34 600 456 789',
    location: 'Zaragoza, España',
    timezone: 'Europe/Madrid',
    twoFactorEnabled: true,
    loginAttempts: 0,
    lastActivity: new Date('2024-01-10T16:45:00')
  },
  {
    id: '7',
    email: 'support@imagiq.com',
    name: 'Roberto Santos',
    avatar: undefined,
    role: 'viewer',
    permissions: rolePermissions.viewer,
    status: 'pending',
    lastLogin: undefined,
    createdAt: new Date('2024-01-14T16:00:00'),
    updatedAt: new Date('2024-01-14T16:00:00'),
    createdBy: '1',
    department: 'Soporte',
    phoneNumber: '+34 600 123 987',
    location: 'Málaga, España',
    timezone: 'Europe/Madrid',
    twoFactorEnabled: false,
    loginAttempts: 0,
    lastActivity: undefined
  },
  {
    id: '8',
    email: 'freelancer@imagiq.com',
    name: 'Elena Jiménez',
    avatar: undefined,
    role: 'editor',
    permissions: rolePermissions.editor,
    status: 'suspended',
    lastLogin: new Date('2024-01-05T12:15:00'),
    createdAt: new Date('2023-08-20T11:00:00'),
    updatedAt: new Date('2024-01-12T10:00:00'),
    createdBy: '2',
    department: 'Freelance',
    phoneNumber: '+34 600 654 321',
    location: 'Granada, España',
    timezone: 'Europe/Madrid',
    twoFactorEnabled: false,
    loginAttempts: 3,
    lastActivity: new Date('2024-01-05T14:30:00')
  }
];

export const mockUserActivity: UserActivity[] = [
  {
    id: '1',
    userId: '1',
    action: 'user.login',
    resource: 'authentication',
    details: { method: '2fa' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date('2024-01-15T10:30:00'),
    success: true
  },
  {
    id: '2',
    userId: '2',
    action: 'campaign.create',
    resource: 'campaigns',
    details: { campaignId: 'camp-123', name: 'Winter Sale 2024' },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: new Date('2024-01-15T11:15:00'),
    success: true
  },
  {
    id: '3',
    userId: '3',
    action: 'user.update',
    resource: 'users',
    details: { targetUserId: '5', changes: ['role'] },
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    timestamp: new Date('2024-01-15T12:00:00'),
    success: true
  },
  {
    id: '4',
    userId: '8',
    action: 'user.login',
    resource: 'authentication',
    details: { method: 'password' },
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    timestamp: new Date('2024-01-12T09:45:00'),
    success: false
  },
  {
    id: '5',
    userId: '4',
    action: 'product.update',
    resource: 'products',
    details: { productId: 'prod-456', changes: ['description', 'images'] },
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date('2024-01-15T13:30:00'),
    success: true
  }
];

export const mockUserStats: UserStats = {
  totalUsers: mockUsers.length,
  activeUsers: mockUsers.filter(u => u.status === 'active').length,
  pendingUsers: mockUsers.filter(u => u.status === 'pending').length,
  suspendedUsers: mockUsers.filter(u => u.status === 'suspended').length,
  newUsersThisMonth: mockUsers.filter(u => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    return u.createdAt >= thisMonth;
  }).length,
  usersByRole: {
    super_admin: mockUsers.filter(u => u.role === 'super_admin').length,
    admin: mockUsers.filter(u => u.role === 'admin').length,
    manager: mockUsers.filter(u => u.role === 'manager').length,
    editor: mockUsers.filter(u => u.role === 'editor').length,
    viewer: mockUsers.filter(u => u.role === 'viewer').length,
  }
};