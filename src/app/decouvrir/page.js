'use client';

import React, { useEffect, useRef, useState } from 'react';
import DynamicController from './DynamicController';

export default function DecouvrirPage() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e) => setReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', handleChange);
      return () => mediaQuery.removeEventListener?.('change', handleChange);
    }
  }, []);

  return <DynamicController reducedMotion={reducedMotion} />;
}
