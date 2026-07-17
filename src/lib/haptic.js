// Haptic & Audio Feedback System (Premium Version for Vestyle)

// Synthétiseur dynamique haut de gamme basé sur la Web Audio API
const playPremiumSynth = (type) => {
  if (typeof window === 'undefined') return;
  
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    if (type === 'success') {
      // 🔔 EFFET CLOCHETTE CRISTALLINE (Succès Panier)
      // Deux notes harmoniques (fondamentale et quinte) qui résonnent
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // Do5 (C5)
      osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // Do6
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now); // Mi5 (E5) (tierce pour un accord joyeux)
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.2); // Mi6
      
      gain1.connect(ctx.destination);
      gain2.connect(ctx.destination);
      osc1.connect(gain1);
      osc2.connect(gain2);
      
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      
      gain2.gain.setValueAtTime(0.05, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc1.start(now);
      osc1.stop(now + 0.6);
      osc2.start(now);
      osc2.stop(now + 0.45);
      
    } else if (type === 'pop') {
      // 🧼 POP DE BULLE PREMIUM AVEC RÉSONANCE (Clic boutique/carte)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.06); // Glissé ultra rapide vers le haut
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.13);
      
    } else if (type === 'radar') {
      // 📡 SONAR RADAR FUTURISTE (Géolocalisation)
      // Une note basse qui monte avec un léger vibrato (effet de balayage laser)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.45);
      
      // Ajout d'une distorsion douce (effet de vague de signal)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1500, now + 0.4);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      
      osc.start(now);
      osc.stop(now + 0.7);
    }
  } catch (e) {
    console.warn('Web Audio non supporté ou bloqué:', e);
  }
};

// ── SYSTEM VIBRATION ──
export const vibrate = (pattern) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (_) {}
  }
};

// ── SÉQUENCE INTRO SIGNATURE "VESTYLE" (Chime de Luxe) ──
export const sayVestyle = () => {
  if (typeof window === 'undefined') return;

  try {
    // Jouer une signature sonore harmonique haut de gamme (style clochette & nappe de mode de luxe)
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      // Accord majestueux (Do, Sol, Do, Mi, Sol) pour un son plein et premium
      const freqs = [130.81, 196.00, 261.63, 329.63, 392.00, 523.25];

      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Oscillation douce (sinusoïdale)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (index * 0.04));
        
        // Léger vibrato haut de gamme
        if (index > 3) {
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.value = 6; // 6Hz
          lfoGain.gain.value = 4; // Intensité
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start(now);
          lfo.stop(now + 1.5);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, now);
        // Attaque douce, decay long et luxueux
        gain.gain.linearRampToValueAtTime(0.04, now + 0.15 + (index * 0.03));
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
        
        osc.start(now);
        osc.stop(now + 1.8);
      });
    }
  } catch (e) {
    console.warn("Échec de la signature sonore :", e);
  }
};

// ── TRIGGER FEEDBACK COMBINÉ ──
export const triggerFeedback = (type) => {
  if (type === 'success') {
    // Une micro vibration ferme, pause, puis une vibration un peu plus longue (effet "Succès!")
    vibrate([30, 40, 60]); 
    playPremiumSynth('success');
  } else if (type === 'pop') {
    // Vibration ultra-légère et rapide (style clic trackpad Apple)
    vibrate(10); 
    playPremiumSynth('pop');
  } else if (type === 'radar') {
    // Triple pulsation de balayage (court, moyen, long)
    vibrate([20, 50, 35, 70, 50, 100]); 
    playPremiumSynth('radar');
  }
};
