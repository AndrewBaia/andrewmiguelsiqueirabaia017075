import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationMessage, Album, Artist } from '../types';
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
    // Conectar ao WebSocket para notificações de álbuns e artistas
    const handleWebSocketMessage = (topic: string, data: any) => {
      if (topic === '/topic/albums') {
        const album = data as Album;
        addNotification(`Álbum atualizado: ${album.titulo}`, 'info');
        appFacade.handleWebSocketAlbumCreate(album);
      } else if (topic === '/topic/albums/delete') {
        addNotification(`Álbum excluído com sucesso`, 'success');
        appFacade.handleWebSocketAlbumDelete(data.id, data.idArtista);
      } else if (topic === '/topic/artists') {
        const artist = data as Artist;
        // Se o artista não tiver foto, provavelmente foi uma remoção de foto
        if (artist.urlImagemPerfil === null || artist.urlImagemPerfil === undefined) {
          addNotification(`Foto do artista removida: ${artist.nome}`, 'info');
        } else {
          addNotification(`Artista atualizado: ${artist.nome}`, 'info');
        }
        appFacade.handleWebSocketArtistCreate(artist);
      } else if (topic === '/topic/artists/delete') {
        const artistId = typeof data === 'number' ? data : parseInt(data);
        addNotification(`Artista excluído com sucesso`, 'success');
        appFacade.handleWebSocketArtistDelete(artistId);
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
