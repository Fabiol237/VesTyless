import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-wa-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-wa-chat rounded-3xl flex items-center justify-center mb-8">
        <span className="text-5xl font-black text-wa-teal">4</span>
        <span className="text-5xl font-black text-wa-green">0</span>
        <span className="text-5xl font-black text-wa-teal">4</span>
      </div>
      <h1 className="text-3xl font-black text-wa-teal-dark mb-3">Page introuvable</h1>
      <p className="text-neutral-500 mb-8 max-w-md">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="px-8 py-4 bg-wa-teal text-white font-bold rounded-2xl hover:bg-wa-teal-dark transition-all shadow-md"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
