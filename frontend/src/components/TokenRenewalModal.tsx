import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface TokenRenewalModalProps {
  show?: boolean;
  onRenew?: () => void;
  onLogout?: () => void;
  timeLeft?: number;
}

/**
 * Modal de renovação de token.
 * Pode ser usado de forma autônoma (via Context) ou controlada (via Props para testes).
 */
export const TokenRenewalModal: React.FC<TokenRenewalModalProps> = ({ 
  show, 
  onRenew, 
  onLogout, 
  timeLeft: propTimeLeft 
}) => {
  const auth = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Sincroniza com props se fornecidas (útil para testes unitários)
  useEffect(() => {
    if (show !== undefined) setShowModal(show);
    if (propTimeLeft !== undefined) setTimeLeft(propTimeLeft);
  }, [show, propTimeLeft]);

  // Lógica principal via Context (quando não em modo de teste)
  useEffect(() => {
    if (show !== undefined) return; // Se show for passado via props, ignora lógica de context
    
    if (!auth.isAuthenticated || !auth.tokenExpiration) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const diff = auth.tokenExpiration! - now;

      if (diff > 0 && diff <= 30000 && !showModal) {
        setShowModal(true);
        setTimeLeft(Math.round(diff / 1000));
      } else if (diff <= 0) {
        setShowModal(false);
        auth.logout();
      } else if (showModal) {
        setTimeLeft(Math.round(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [auth.isAuthenticated, auth.tokenExpiration, showModal, auth.logout, show]);

  const handleRenew = async () => {
    if (onRenew) {
      onRenew();
    } else {
      await auth.refreshToken();
      setShowModal(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      setShowModal(false);
      auth.logout();
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#282828] p-8 rounded-lg shadow-2xl max-w-md w-full border border-[#333] transform animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-spotify-green/10 mb-6">
            <span className="text-spotify-green text-2xl">⏳</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Sua sessão está expirando</h3>
          <p className="text-spotify-subtext mb-8 text-lg leading-relaxed">
            Você será desconectado automaticamente em <span className="font-bold text-white bg-red-500/20 px-2 py-1 rounded">{timeLeft} segundos</span>.
            <br />Deseja continuar sua sessão?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRenew}
              className="w-full py-4 bg-spotify-green text-black font-bold rounded-full hover:scale-105 transition-transform text-sm tracking-widest uppercase"
            >
              CONTINUAR CONECTADO
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-transparent text-white font-bold rounded-full hover:text-red-500 transition-colors text-sm tracking-widest uppercase border border-[#535353] hover:border-red-500"
            >
              SAIR AGORA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenRenewalModal;
