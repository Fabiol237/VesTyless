"use client";
import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, ShoppingBag, Info, Clock, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function NotificationsPage() {
  const { store } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler des notifications pour le moment ou les charger si elles existent en DB
    // Pour une version premium, on peut générer des notifs basées sur les commandes récentes
    const mockNotifications = [
      {
        id: 1,
        title: "Bienvenue sur VesTyle !",
        message: "Votre boutique est prête. Commencez à ajouter des produits pour vendre.",
        type: "info",
        time: "Il y a 2h",
        read: false
      },
      {
        id: 2,
        title: "Nouveau Design Activé",
        message: "Votre tableau de bord a été mis à jour avec le thème WhatsApp Premium.",
        type: "success",
        time: "Il y a 5h",
        read: true
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  }, [store]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-wa-teal">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Centre de Notifications</h1>
            <p className="text-sm text-gray-500 font-medium">Restez informé de l'activité de votre boutique.</p>
          </div>
        </div>
        <button 
          onClick={markAllRead}
          className="text-xs font-black text-wa-teal uppercase tracking-widest hover:text-wa-teal-dark transition-colors"
        >
          Tout marquer lu
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-gray-400">
            <div className="w-12 h-12 border-4 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest">Chargement...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
              <Bell size={40} />
            </div>
            <h3 className="font-black text-gray-900">Aucune notification</h3>
            <p className="text-sm text-gray-500 mt-1">Vous êtes à jour ! Revenez plus tard.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-6 flex items-start gap-4 hover:bg-gray-50/50 transition-all group ${!n.read ? 'bg-wa-chat/10' : ''}`}
              >
                <div className={`p-3 rounded-2xl flex-shrink-0 ${
                  n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                  n.type === 'info' ? 'bg-wa-chat text-wa-teal' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {n.type === 'success' ? <CheckCircle2 size={20} /> :
                   n.type === 'info' ? <Info size={20} /> :
                   <ShoppingBag size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-bold text-gray-900 truncate ${!n.read ? 'pr-4 relative after:content-[""] after:absolute after:top-1/2 after:-right-1 after:w-2 after:h-2 after:bg-wa-teal after:rounded-full after:-translate-y-1/2' : ''}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {n.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                </div>

                <button 
                  onClick={() => deleteNotification(n.id)}
                  className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Settings Link */}
      <div className="bg-wa-chat p-6 rounded-3xl border border-wa-teal/10 flex items-center justify-between group cursor-pointer hover:bg-wa-chat/80 transition-all">
        <div className="flex items-center gap-4">
          <div className="bg-wa-teal p-2 rounded-xl text-white">
            <Bell size={20} />
          </div>
          <div>
            <h4 className="font-black text-wa-teal-dark text-sm">Paramètres des notifications</h4>
            <p className="text-xs text-wa-teal-dark/60 font-medium">Gérez comment vous souhaitez être alerté.</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-wa-teal group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

function ChevronRight({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
