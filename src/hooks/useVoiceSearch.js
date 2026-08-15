'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export function useVoiceSearch(onResult, onInterimResult) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'fr-FR';

        recog.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript && onResult) {
            onResult(finalTranscript);
          } else if (interimTranscript && onInterimResult) {
            onInterimResult(interimTranscript);
          }
        };

        // Gestion silencieuse des erreurs sans polluer la console dev
        recog.onerror = (event) => {
          setIsListening(false);

          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setError('Micro non autorisé.');
          } else if (event.error === 'no-speech') {
            setError('Aucune voix détectée.');
          } else if (event.error !== 'aborted') {
            setError('Erreur micro.');
          }

          setTimeout(() => setError(null), 3000);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        setRecognition(recog);
        recognitionRef.current = recog;
      }
    }
  }, [onResult, onInterimResult]);

  const toggleListening = useCallback(async () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        setError(null);

        // Demander d'abord la permission microphone au navigateur de manière propre
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
            setError('Micro non autorisé.');
            return null;
          });
        }

        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  }, [isListening, isSupported]);

  return {
    isListening,
    isSupported,
    toggleListening,
    error
  };
}
