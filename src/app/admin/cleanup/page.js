'use client';
import { useState } from 'react';
import { AlertTriangle, Play, RefreshCw, Trash2, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdminCleanupPage() {
  const [adminToken, setAdminToken] = useState('');
  const [action, setAction] = useState('status');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runCleanup = async (selectedAction) => {
    if (!adminToken) {
      setError('Token admin requis');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/cleanup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminToken,
          action: selectedAction || action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors du nettoyage');
        return;
      }

      setResult(data);
      setAction('status'); // Reset to status after cleanup
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle size={32} className="text-red-600" />
            <h1 className="text-3xl font-black text-gray-900">Nettoyage Base de Données</h1>
          </div>

          <p className="text-gray-600 mb-8 font-medium">
            Désactivez les boutiques vides, réactivez les boutiques avec produits, corrigez les données manquantes.
          </p>

          {/* Token Input */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">Token Admin</label>
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Entrez le token admin"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              ℹ️ Le token est défini dans <code className="bg-gray-200 px-2 py-1 rounded">ADMIN_CLEANUP_TOKEN</code> (.env)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => runCleanup('status')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading && action === 'status' ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <RefreshCw size={20} />
              )}
              Diagnostic
            </button>

            <button
              onClick={() => runCleanup('report')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading && action === 'report' ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Play size={20} />
              )}
              Rapport
            </button>

            <button
              onClick={() => {
                if (window.confirm('⚠️ ATTENTION: Cela désactivera les vieilles boutiques vides. Continuer ?')) {
                  runCleanup('cleanup');
                }
              }}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading && action === 'cleanup' ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Trash2 size={20} />
              )}
              Nettoyer
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={24} className="text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">{result.status === 'ok' ? '✅ Succès' : '⚠️ Erreur'}</h2>
              </div>

              <pre className="bg-white p-4 rounded border border-green-200 overflow-x-auto text-sm font-mono text-gray-700">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Errors */}
          {error && (
            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
              <h2 className="text-lg font-bold text-red-700 mb-2">❌ Erreur</h2>
              <p className="text-red-600 font-mono text-sm">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-sm text-yellow-700 font-semibold">
              💡 Actions disponibles:
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
              <li><strong>Diagnostic</strong>: Voir l'état actuel de la BD</li>
              <li><strong>Rapport</strong>: Lister toutes les boutiques et leurs produits</li>
              <li><strong>Nettoyer</strong>: Désactiver les vieilles boutiques vides + réactiver celles avec produits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
