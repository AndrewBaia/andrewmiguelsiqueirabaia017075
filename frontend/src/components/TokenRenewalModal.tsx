import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const TokenRenewalModal: React.FC = () => {
  const { isAuthenticated, tokenExpiration, refreshToken, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!isAuthenticated || !tokenExpiration) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const diff = tokenExpiration - now;

      // Mostrar modal 30 segundos antes de expirar
      if (diff > 0 && diff <= 30000 && !showModal) {
        setShowModal(true);
        setTimeLeft(Math.round(diff / 1000));
      } else if (diff <= 0) {
        setShowModal(false);
        logout();
      } else if (showModal) {
        setTimeLeft(Math.round(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, tokenExpiration, showModal, logout]);

  const handleRenew = async () => {
    await refreshToken();
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Sua sessão vai expirar</h3>
        <p className="text-gray-600 mb-6">
          Você será desconectado em <span className="font-bold text-red-600">{timeLeft} segundos</span>. 
          Deseja continuar conectado?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowModal(false);
              logout();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Sair
          </button>
          <button
            onClick={handleRenew}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Continuar Conectado
          </button>
        </div>
      </div>
    </div>
  );
};

