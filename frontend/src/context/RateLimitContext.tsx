import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface RateLimitContextType {
  showModal: boolean;
  timeLeft: number;
  triggerRateLimit: (seconds?: number) => void;
  hideModal: () => void;
  resetRateLimit: () => void;
}

const RateLimitContext = createContext<RateLimitContextType | undefined>(undefined);

export const RateLimitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const resetRateLimit = useCallback(() => {
    setTimeLeft(0);
    setShowModal(false);
    // Limpa o localStorage para garantir que não persista entre reloads/logins
    localStorage.removeItem('rateLimitTime');
    localStorage.removeItem('rateLimitMinimized');
    // Adiciona uma trava temporária para evitar que novos disparos ocorram imediatamente após o login
    localStorage.setItem('rateLimitResetAt', Date.now().toString());
  }, []);

  const triggerRateLimit = useCallback((seconds: number = 60) => {
    // Só dispara se não houver um countdown ativo
    if (timeLeft > 0) return;

    // Verifica se houve um reset recente (nos últimos 2 segundos) para evitar o disparo no relog
    const lastReset = localStorage.getItem('rateLimitResetAt');
    if (lastReset && (Date.now() - parseInt(lastReset) < 2000)) {
      return;
    }
    
    const expiration = Date.now() + (seconds * 1000);
    localStorage.setItem('rateLimitTime', expiration.toString());
    localStorage.removeItem('rateLimitMinimized');
    
    setTimeLeft(seconds);
    setShowModal(true);
  }, [timeLeft]);

  const hideModal = useCallback(() => {
    setShowModal(false);
    localStorage.setItem('rateLimitMinimized', 'true');
  }, []);

  useEffect(() => {
    // Tenta recuperar do localStorage ao inicializar
    const stored = localStorage.getItem('rateLimitTime');
    const wasMinimized = localStorage.getItem('rateLimitMinimized') === 'true';

    if (stored) {
      const expirationTime = parseInt(stored);
      const diff = Math.round((expirationTime - Date.now()) / 1000);
      
      if (diff > 0) {
        setTimeLeft(diff);
        // Se ainda houver tempo, mostra o modal apenas se ele NÃO foi minimizado anteriormente
        setShowModal(!wasMinimized);
      } else {
        localStorage.removeItem('rateLimitTime');
        localStorage.removeItem('rateLimitMinimized');
      }
    }
  }, []);

  useEffect(() => {
    // Se não houver tempo inicial, não inicia o intervalo
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      const stored = localStorage.getItem('rateLimitTime');
      if (stored) {
        const expirationTime = parseInt(stored);
        const diff = Math.round((expirationTime - Date.now()) / 1000);
        
        if (diff <= 0) {
          setTimeLeft(0);
          setShowModal(false);
          localStorage.removeItem('rateLimitTime');
          localStorage.removeItem('rateLimitMinimized');
          clearInterval(timer);
        } else {
          // Atualiza o estado com o tempo real restante baseado no timestamp fixo
          setTimeLeft(diff);
        }
      } else {
        setTimeLeft(0);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft > 0]); // Dependência simplificada para evitar reinícios desnecessários do intervalo

  const value = {
    showModal,
    timeLeft,
    triggerRateLimit,
    hideModal,
    resetRateLimit,
  };

  return (
    <RateLimitContext.Provider value={value}>
      {children}
    </RateLimitContext.Provider>
  );
};

export const useRateLimit = () => {
  const context = useContext(RateLimitContext);
  if (context === undefined) {
    throw new Error('useRateLimit must be used within a RateLimitProvider');
  }
  return context;
};

// Singleton para acesso fora de componentes React (ex: api.ts)
let triggerRateLimitFn: (seconds?: number) => void = () => {
  console.warn('RateLimitProvider not initialized');
};

export const triggerGlobalRateLimit = (seconds?: number) => {
  triggerRateLimitFn(seconds);
};

export const RateLimitInitializer: React.FC = () => {
  const { triggerRateLimit } = useRateLimit();
  useEffect(() => {
    triggerRateLimitFn = triggerRateLimit;
  }, [triggerRateLimit]);
  return null;
};

