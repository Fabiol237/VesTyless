'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Home } from 'lucide-react';

export default function BackNavigation({ title, showHomeOnly = false }) {
  const router = useRouter();

  if (showHomeOnly) {
    return (
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-wa-teal hover:text-wa-teal-dark transition-colors mb-6"
      >
        <Home size={18} />
        <span className="text-sm font-medium">Accueil</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-6 relative z-40 pointer-events-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-wa-teal hover:text-wa-teal-dark transition-colors"
        title="Retour à la page précédente"
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-medium">Retour</span>
      </button>
      {title && (
        <>
          <span className="text-neutral-400">/</span>
          <span className="text-sm text-neutral-600">{title}</span>
        </>
      )}
    </div>
  );
}
