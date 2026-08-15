'use client';
import { useState } from 'react';
import { exportToCSV, parseCSV } from '@/lib/csvHelper';
import { supabase } from '@/lib/supabase';
import { triggerFeedback } from '@/lib/haptic';

/**
 * VesTyle — CsvImportExportModal
 * Composant permettant aux vendeurs d'importer / exporter leur catalogue entier en CSV.
 */
export default function CsvImportExportModal({ storeId, products = [], onImportComplete, onClose }) {
  const [loading, setLoading] = useState(false);
  const [parsedProducts, setParsedProducts] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Exportation CSV
  const handleExport = () => {
    triggerFeedback('pop');
    if (!products || products.length === 0) {
      setErrorMsg('Aucun produit à exporter.');
      return;
    }

    const exportData = products.map(p => ({
      Nom: p.name,
      Prix: p.price,
      Prix_Original: p.original_price || '',
      Categorie: p.category || 'Mode & Beauté',
      Description: p.description || '',
      Stock: p.stock_quantity || 1,
      Image_URL: p.image_url || '',
    }));

    exportToCSV(exportData, `catalogue_vestyle_store_${storeId || 'export'}.csv`);
    setSuccessMsg(`✅ ${products.length} produit(s) exporté(s) en CSV !`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Sélection et analyse du fichier CSV
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setLoading(true);
    try {
      const items = await parseCSV(file);
      if (!items || items.length === 0) {
        setErrorMsg('Fichier CSV vide ou format invalide.');
        setParsedProducts(null);
      } else {
        setParsedProducts(items);
        triggerFeedback('success');
      }
    } catch (err) {
      setErrorMsg('Erreur lors de la lecture du fichier CSV.');
    } finally {
      setLoading(false);
    }
  };

  // Confirmation de l'import dans Supabase
  const handleConfirmImport = async () => {
    if (!parsedProducts || !storeId) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = parsedProducts.map(p => ({
        store_id: storeId,
        name: p.name,
        price: p.price,
        original_price: p.original_price,
        category: p.category,
        description: p.description,
        image_url: p.image_url,
        stock_quantity: p.stock_quantity,
        is_active: true,
      }));

      const { data, error } = await supabase.from('products').insert(payload).select();

      if (error) throw error;

      triggerFeedback('success');
      setSuccessMsg(`🎉 ${data.length} produit(s) importé(s) avec succès !`);
      setParsedProducts(null);
      if (onImportComplete) onImportComplete(data);
      setTimeout(() => onClose && onClose(), 2000);
    } catch (err) {
      console.error('[CSV Import Error]:', err);
      setErrorMsg('Erreur lors de l\'enregistrement dans la base de données: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6 relative animate-scale-up">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              📄 Import / Export CSV (PapaParse)
            </h2>
            <p className="text-xs text-slate-500 font-medium">Gérez votre catalogue de produits en masse</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold p-1">✕</button>
        </div>

        {/* Messages d'alerte */}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold p-3 rounded-2xl">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold p-3 rounded-2xl">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Exporter */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Exporter</h3>
              <p className="text-[11px] text-slate-500">Téléchargez vos {products.length} produits en fichier CSV.</p>
            </div>
            <button
              onClick={handleExport}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md"
            >
              📥 Exporter CSV
            </button>
          </div>

          {/* Importer */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-extrabold text-sm text-blue-900">Importer</h3>
              <p className="text-[11px] text-blue-700">Sélectionnez un fichier .csv contenant vos produits.</p>
            </div>
            <label className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md text-center cursor-pointer block">
              {loading ? 'Analyse...' : '📤 Choisir CSV'}
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" disabled={loading} />
            </label>
          </div>
        </div>

        {/* Aperçu des produits analysés */}
        {parsedProducts && parsedProducts.length > 0 && (
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">
                Aperçu : {parsedProducts.length} produit(s) prêt(s) à l'import
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs font-medium text-slate-600">
              {parsedProducts.slice(0, 5).map((p, idx) => (
                <div key={idx} className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="font-bold truncate max-w-[200px]">{p.name}</span>
                  <span className="font-mono text-slate-900">{p.price} FCFA</span>
                </div>
              ))}
              {parsedProducts.length > 5 && (
                <p className="text-[10px] text-slate-400 italic">+ {parsedProducts.length - 5} autres produits...</p>
              )}
            </div>

            <button
              onClick={handleConfirmImport}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-600/20"
            >
              {loading ? 'Enregistrement...' : '🚀 Valider l\'import en BDD'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
