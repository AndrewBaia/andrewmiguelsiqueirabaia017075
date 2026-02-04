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
    
    setTimeLeft(seconds);
    setShowModal(true);
  }, [timeLeft]);

  const hideModal = useCallback(() => {
    setShowModal(false);
  }, []);

  useEffect(() => {
    // Tenta recuperar do localStorage ao inicializar
    const stored = localStorage.getItem('rateLimitTime');
    if (stored) {
      const diff = Math.round((parseInt(stored) - Date.now()) / 1000);
      if (diff > 0) {
        setTimeLeft(diff);
      } else {
        localStorage.removeItem('rateLimitTime');
      }
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setShowModal(false);
      localStorage.removeItem('rateLimitTime');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timer);
          localStorage.removeItem('rateLimitTime');
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

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

