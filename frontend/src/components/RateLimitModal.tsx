import React from 'react';
import { useRateLimit } from '../context/RateLimitContext';

export const RateLimitModal: React.FC = () => {
  const { showModal, timeLeft, hideModal } = useRateLimit();
  
  // O estado visível depende apenas de haver tempo restante
  const visible = timeLeft > 0;
  
  // O estado minimizado deve seguir estritamente o showModal do contexto
  const isMinimized = !showModal;

  if (!visible) return null;

  const handleCloseModal = () => {
    hideModal();
  };

  return (
    <>
      {/* Modal Inicial (Centralizado) */}
      {!isMinimized && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-300">
          <div className="bg-[#282828] p-6 rounded-lg shadow-2xl max-w-sm w-full border border-[#333] transform animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Limite de Requisições</h3>
              <p className="text-spotify-subtext mb-6 text-sm leading-relaxed">
                Você atingiu o limite de <span className="text-white font-bold">10 requisições por minuto</span>.
                Aguarde o cronômetro para continuar.
              </p>
              
              <div className="flex flex-col items-center mb-6">
                <div className="text-4xl font-black text-spotify-green tabular-nums">
                  {timeLeft}s
                </div>
                <div className="w-full bg-[#121212] h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-spotify-green h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full py-3 bg-spotify-green text-black font-bold rounded-full hover:scale-105 transition-transform text-xs tracking-widest uppercase"
              >
                ENTENDI
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
