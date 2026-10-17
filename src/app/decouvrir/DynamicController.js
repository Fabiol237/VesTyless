'use client';

import React, { useEffect, useRef, useState } from 'react';
import Scene1Door from '@/components/decouvrir/Scene1Door';
import Scene2Shelf from '@/components/decouvrir/Scene2Shelf';
import Scene3VisualSearch from '@/components/decouvrir/Scene3VisualSearch';
import Scene4Negotiation from '@/components/decouvrir/Scene4Negotiation';
import Scene5VoiceAI from '@/components/decouvrir/Scene5VoiceAI';
import Scene6GroupBuy from '@/components/decouvrir/Scene6GroupBuy';
import Scene7MobilePayment from '@/components/decouvrir/Scene7MobilePayment';
import Scene8FinalCTA from '@/components/decouvrir/Scene8FinalCTA';

export default function DynamicController({ reducedMotion }) {
  const [activeScene, setActiveScene] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') return;

    let lenis;
    let ScrollTrigger;
    let gsap;

    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('lenis')
    ]).then(([gsapModule, stModule, lenisModule]) => {
      gsap = gsapModule.default || gsapModule;
      ScrollTrigger = stModule.ScrollTrigger || stModule.default;
      const Lenis = lenisModule.default || lenisModule;

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      const totalScenes = 8;

      ScrollTrigger.create({
        trigger: triggerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
        onUpdate: (self) => {
          const rawIndex = self.progress * (totalScenes - 1);
          const currentIdx = Math.min(Math.floor(rawIndex), totalScenes - 1);
          const currentProg = rawIndex - currentIdx;

          setActiveScene(currentIdx);
          setSceneProgress(currentProg);
        },
      });
    }).catch(err => {
      console.warn('Animation engine failed to load:', err);
    });

    return () => {
      if (ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
      if (lenis) lenis.destroy();
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <main className="w-full min-h-screen bg-slate-950 text-white space-y-16 py-12 px-4 max-w-md mx-auto">
        <Scene1Door progress={1} />
        <Scene2Shelf progress={1} />
        <Scene3VisualSearch progress={1} />
        <Scene4Negotiation progress={1} />
        <Scene5VoiceAI progress={1} />
        <Scene6GroupBuy progress={1} />
        <Scene7MobilePayment progress={1} />
        <Scene8FinalCTA progress={1} />
      </main>
    );
  }

  const scenes = [
    <Scene1Door key="1" progress={activeScene === 0 ? sceneProgress : activeScene > 0 ? 1 : 0} />,
    <Scene2Shelf key="2" progress={activeScene === 1 ? sceneProgress : activeScene > 1 ? 1 : 0} />,
    <Scene3VisualSearch key="3" progress={activeScene === 2 ? sceneProgress : activeScene > 2 ? 1 : 0} />,
    <Scene4Negotiation key="4" progress={activeScene === 3 ? sceneProgress : activeScene > 3 ? 1 : 0} />,
    <Scene5VoiceAI key="5" progress={activeScene === 4 ? sceneProgress : activeScene > 4 ? 1 : 0} />,
    <Scene6GroupBuy key="6" progress={activeScene === 5 ? sceneProgress : activeScene > 5 ? 1 : 0} />,
    <Scene7MobilePayment key="7" progress={activeScene === 6 ? sceneProgress : activeScene > 6 ? 1 : 0} />,
    <Scene8FinalCTA key="8" progress={activeScene === 7 ? sceneProgress : activeScene > 7 ? 1 : 0} />,
  ];

  return (
    <div ref={triggerRef} className="relative bg-slate-950 text-white min-h-[800vh]">
      {/* Sticky viewport container */}
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden z-10">
        {/* Step Indicator Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 shadow-xl">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeScene
                  ? 'w-6 bg-emerald-400'
                  : idx < activeScene
                  ? 'w-2 bg-emerald-600'
                  : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Active Scene Display */}
        <div className="w-full h-full flex items-center justify-center p-4">
          {scenes[activeScene]}
        </div>
      </div>
    </div>
  );
}
