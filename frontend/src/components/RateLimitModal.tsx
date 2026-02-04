import React, { useState, useEffect } from 'react';
import { useRateLimit } from '../context/RateLimitContext';

export const RateLimitModal: React.FC = () => {
  const { showModal, timeLeft, hideModal } = useRateLimit();
  const [isMinimized, setIsMinimized] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      setVisible(true);
      // Se showModal for true, significa que é um novo disparo ou ainda não foi minimizado
      if (showModal) {
        setIsMinimized(false);
      }
    } else {
      setVisible(false);
      setIsMinimized(false);
      // Garante que o estado interno de minimização resete para o próximo disparo
    }
  }, [showModal, timeLeft]);

  if (!visible) return null;

  const handleCloseModal = () => {
    setIsMinimized(true);
    hideModal(); // Avisa o contexto que o modal central não deve mais aparecer
  };

  return (
    <>
      {/* Modal Inicial (Centralizado) */}
      {!isMinimized && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-[#282828] p-8 rounded-lg shadow-2xl max-w-md w-full border border-[#333] transform animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-6">
                <span className="text-red-500 text-2xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Limite de Requisições</h3>
              <p className="text-spotify-subtext mb-8 text-lg leading-relaxed">
                Você atingiu o limite de <span className="text-white font-bold">10 requisições por minuto</span>.
                <br />
                Por favor, aguarde o cronômetro zerar para continuar.
              </p>
              
              <div className="flex flex-col items-center mb-8">
                <div className="text-5xl font-black text-spotify-green tabular-nums">
                  {timeLeft}s
                </div>
                <div className="w-full bg-[#121212] h-2 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="bg-spotify-green h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full py-4 bg-spotify-green text-black font-bold rounded-full hover:scale-105 transition-transform text-sm tracking-widest uppercase"
              >
                ENTENDI, VOU AGUARDAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cronômetro Flutuante (Canto Inferior Direito) */}
      <div 
        className={`fixed bottom-6 right-6 z-[10001] transition-all duration-700 ease-in-out transform ${
          isMinimized ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-20 opacity-0 scale-50 pointer-events-none'
        }`}
      >
        <div className="bg-[#282828] border border-spotify-green/30 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[140px]">
          <div className="relative h-10 w-10 flex items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="#121212"
                strokeWidth="4"
              />
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="#1ed760"
                strokeWidth="4"
                strokeDasharray={113}
                strokeDashoffset={113 - (113 * timeLeft) / 60}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="text-xs font-bold text-white tabular-nums z-10">{timeLeft}s</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-spotify-subtext font-bold">Aguarde</span>
            <span className="text-xs text-white font-medium">Rate Limit</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default RateLimitModal;

