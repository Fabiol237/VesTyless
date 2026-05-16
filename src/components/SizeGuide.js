'use client';
import { useState, useEffect } from 'react';
import { Ruler, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SizeGuide({ productId, productCategory = 'clothing' }) {
  const [guide, setGuide] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    fetchSizeGuide();
  }, [productId]);

  const fetchSizeGuide = async () => {
    const { data } = await supabase
      .from('size_guides')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (data) {
      setGuide(data);
    } else {
      setGuide(defaultGuide[productCategory] || defaultGuide.clothing);
    }
  };

  const defaultGuide = {
    clothing: {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      guide_data: {
        'Poitrine (cm)': ['75-80', '80-85', '85-90', '90-95', '95-100', '100-110'],
        'Taille (cm)': ['60-65', '65-70', '70-75', '75-80', '80-85', '85-95'],
        'Longueur (cm)': ['60', '62', '64', '66', '68', '70']
      }
    },
    shoes: {
      sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
      guide_data: {
        'Longueur (cm)': ['22', '22.5', '23', '23.5', '24', '24.5', '25', '25.5', '26', '26.5', '27']
      }
    }
  };

  const data = guide || defaultGuide[productCategory];
  if (!data) return null;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition font-bold"
      >
        <div className="flex items-center gap-3">
          <Ruler className="text-emerald-600" size={20} />
          Guide des tailles
        </div>
        <ChevronDown size={20} className={`transition ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="p-6 space-y-6">
          {/* Size Selection */}
          <div>
            <label className="block font-bold mb-3">Votre taille</label>
            <div className="flex flex-wrap gap-2">
              {data.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-lg border-2 font-bold transition ${
                    selectedSize === size
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Measurements Table */}
          {selectedSize && (
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="font-bold mb-3">Mesures pour la taille {selectedSize}</p>
              <div className="space-y-2 text-sm">
                {Object.entries(data.guide_data).map(([key, values]) => {
                  const sizeIndex = data.sizes.indexOf(selectedSize);
                  return (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-600">{key}:</span>
                      <span className="font-bold">{values[sizeIndex]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Size Chart */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="text-left p-3 font-bold">Taille</th>
                  {Object.keys(data.guide_data).map(key => (
                    <th key={key} className="text-left p-3 font-bold">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.sizes.map((size, idx) => (
                  <tr key={size} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-bold">{size}</td>
                    {Object.values(data.guide_data).map((values, i) => (
                      <td key={i} className="p-3 text-slate-600">{values[idx]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-bold mb-2">💡 Conseil</p>
            <p className="text-slate-700">
              Pour un meilleur résultat, vérifiez les mesures avec un vêtement similaire que vous possédez déjà.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
