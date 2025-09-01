import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext debe ser usado dentro de un NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

// Datos de ejemplo para notificaciones
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Nueva inversión disponible',
    message: 'Se ha agregado un nuevo fondo de inversión con rendimiento del 12% anual.',
    type: 'success',
    timestamp: '2023-05-20T10:30:00Z',
    read: false
  },
  {
    id: '2',
    title: 'Recordatorio de pago',
    message: 'Su próximo pago de inversión vence en 3 días.',
    type: 'warning',
    timestamp: '2023-05-19T15:45:00Z',
    read: false
  },
  {
    id: '3',
    title: 'Actualización de perfil',
    message: 'Su información de perfil ha sido actualizada exitosamente.',
    type: 'info',
    timestamp: '2023-05-18T09:15:00Z',
    read: true
  },
  {
    id: '4',
    title: 'Ganancia generada',
    message: 'Su inversión en el Fondo Crecimiento ha generado $250 en ganancias.',
    type: 'success',
    timestamp: '2023-05-17T14:20:00Z',
    read: true
  },
  {
    id: '5',
    title: 'Mantenimiento programado',
    message: 'El sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM.',
    type: 'info',
    timestamp: '2023-05-16T11:00:00Z',
    read: false
  }
];

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (newNotification: Omit<Notification, 'id'>) => {
    const notification: Notification = {
      ...newNotification,
      id: Date.now().toString(),
    };
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export type { Notification };