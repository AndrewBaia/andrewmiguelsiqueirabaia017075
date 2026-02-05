import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationMessage, Album } from '../types';
import { webSocketService } from '../services/websocket';
import { appFacade } from '../services/facade';

interface NotificationContextType {
  notifications: NotificationMessage[];
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (index: number) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  useEffect(() => {
    // Conectar ao WebSocket para notificações de álbuns
    const handleWebSocketMessage = (data: any) => {
      if (typeof data === 'object' && data.titulo) {
        const album = data as Album;
        addNotification(`Novo álbum cadastrado: ${album.titulo}`, 'info');
        
        // Se o álbum pertencer ao artista que está sendo visualizado, atualiza a lista
        // O Facade gerencia se deve ou não atualizar baseado no estado atual
        appFacade.handleWebSocketAlbumCreate(album);
      } else {
        addNotification(String(data), 'info');
      }
    };

    webSocketService.connect(handleWebSocketMessage);

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification: NotificationMessage = {
      message,
      type,
    };

    setNotifications(prev => [...prev, notification]);

    // Remover automaticamente após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== notification));
    }, 5000);
  };

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
