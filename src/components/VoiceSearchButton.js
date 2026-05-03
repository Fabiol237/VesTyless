'use client';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';

const MicIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const MicOffIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="2" x2="22" y1="2" y2="22"/>
    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
    <path d="M5 10v2a7 7 0 0 0 12 5l-1.5 1.5a5 5 0 0 1-9-5v-2"/>
    <path d="M9 4.3a3 3 0 0 1 6 1.7v3.5"/>
    <path d="M12 19v3"/>
  </svg>
);

export default function VoiceSearchButton({ onResult, onInterimResult, className = "" }) {
  const { isListening, isSupported, toggleListening, error } = useVoiceSearch(onResult, onInterimResult);

  if (!isSupported) return null;

  return (
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={toggleListening}
        className={`relative flex items-center justify-center transition-all duration-300 ${isListening ? 'text-white bg-red-500 rounded-full scale-110 shadow-lg shadow-red-500/40 p-1.5' : 'text-neutral-400 hover:text-wa-teal'} ${className}`}
        title={isListening ? "Arrêter l'écoute" : "Recherche vocale"}
      >
        {isListening ? (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-40"></span>
            <MicOffIcon size={16} className="relative z-10 animate-pulse" />
          </>
        ) : <MicIcon size={18} />}
      </button>

      {error && (
        <div className="absolute bottom-full right-0 mb-3 w-max px-3 py-1.5 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-xl animate-fade-in z-50">
          {error}
          <div className="absolute top-full right-4 w-2 h-2 bg-neutral-900 rotate-45 -translate-y-1"></div>
        </div>
      )}
    </div>
  );
}
