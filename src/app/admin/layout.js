import Link from 'next/link';

export const metadata = {
  title: 'Super Admin - Écosystème Local',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 md:min-h-screen flex flex-col shrink-0">
        <h2 className="text-xl font-bold tracking-tight mb-8 text-wa-teal">SuperAdmin.</h2>
        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/admin" className="px-3 py-2 bg-white/10 rounded-lg text-sm font-medium">Boutiques (Global)</Link>
          <Link href="/admin/produits" className="px-3 py-2 hover:bg-white/5 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">Tous les Produits</Link>
          <Link href="/admin/utilisateurs" className="px-3 py-2 hover:bg-white/5 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">Utilisateurs</Link>
          <Link href="/admin/finances" className="px-3 py-2 hover:bg-white/5 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">Finances</Link>
        </nav>
        <div className="mt-8 pt-8 border-t border-white/10">
           <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-2">← Retour au site</Link>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
