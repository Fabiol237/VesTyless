'use client';
import { useState, useEffect, useCallback } from 'react';

export function useVoiceSearch(onResult, onInterimResult) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'fr-FR'; // Default to French for this app

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

        recog.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          if (event.error === 'not-allowed') {
            setError('Micro refusé.');
          } else {
            setError('Erreur vocale.');
          }
          setIsListening(false);
          
          // Clear error after 3s
          setTimeout(() => setError(null), 3000);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        setRecognition(recog);
      }
    }
  }, [onResult, onInterimResult]);

  const toggleListening = useCallback(() => {
    if (!isSupported || !recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        setError(null);
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Erreur lors du démarrage de la reconnaissance vocale:", e);
      }
    }
  }, [isListening, isSupported, recognition]);

  return {
    isListening,
    isSupported,
    toggleListening,
    error
  };
}
