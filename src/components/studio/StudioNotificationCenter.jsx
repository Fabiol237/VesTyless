'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, Clock, ExternalLink, Package, ShoppingBag, Inbox, AlertTriangle, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return 'À l\'instant';
    if (diffSec < 3600) return `Il y a ${Math.floor(diffSec / 60)} min`;
    if (diffSec < 86400) return `Il y a ${Math.floor(diffSec / 3600)} h`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

function getNotificationIcon(type) {
  switch (type) {
    case 'order_created':
    case 'order_placed':
      return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
    case 'order_status':
      return <Clock className="w-4 h-4 text-blue-400" />;
    case 'lead':
      return <Inbox className="w-4 h-4 text-indigo-400" />;
    case 'stock_low':
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    default:
      return <Bell className="w-4 h-4 text-slate-400" />;
  }
}

export default function StudioNotificationCenter({ store }) {
  const storeId = store?.id;
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const containerRef = useRef(null);

  // Charger les notifications réelles pour la boutique active
  const fetchNotifications = useCallback(async () => {
    if (!storeId) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications/manage?storeId=${storeId}&limit=30`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.warn('[StudioNotificationCenter] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    if (!storeId || !notificationId) return;
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      await fetch('/api/notifications/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, notificationId, isRead: true }),
      });
    } catch (err) {
      console.warn('[StudioNotificationCenter] Mark read error:', err);
    }
  };

  // Tout marquer comme lu
  const markAllAsRead = async () => {
    if (!storeId) return;
    setMarkingAll(true);
    try {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await fetch('/api/notifications/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, markAllRead: true }),
      });
    } catch (err) {
      console.warn('[StudioNotificationCenter] Mark all read error:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative" ref={containerRef}>
      {/* Bouton Cloche */}
      <button
        type="button"
        id="studio-notifications-button"
        onClick={() => {
          setIsOpen(prev => !prev);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        title="Notifications et Alertes"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-100">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    disabled={markingAll}
                    className="text-[11px] font-medium text-slate-400 hover:text-emerald-400 transition flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Tout lire</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
              {loading && notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Chargement des alertes...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-300">Aucune notification</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Les nouvelles commandes, demandes clients et alertes apparaîtront ici.
                  </div>
                </div>
              ) : (
                notifications.map(notif => {
                  const isUnread = !notif.is_read;
                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 transition flex items-start gap-3 relative hover:bg-slate-800/50 ${
                        isUnread ? 'bg-slate-850/60' : 'bg-transparent'
                      }`}
                    >
                      {/* Pastille non lue */}
                      {isUnread && (
                        <div className="absolute left-1.5 top-5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      )}

                      {/* Icon */}
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className={`text-xs truncate ${isUnread ? 'font-bold text-slate-100' : 'font-medium text-slate-300'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {formatRelativeTime(notif.created_at)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-1.5">
                          {notif.message}
                        </p>

                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notif.id)}
                              className="text-[10px] text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Marquer comme lu</span>
                            </button>
                          )}

                          {notif.related_order_id && (
                            <Link
                              href={`/dashboard/orders?id=${notif.related_order_id}`}
                              onClick={() => {
                                markAsRead(notif.id);
                                setIsOpen(false);
                              }}
                              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-medium ml-auto"
                            >
                              <span>Voir commande</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-center">
              <span className="text-[10px] text-slate-500">
                Boutique active : <span className="text-slate-300 font-medium">{store?.name || 'VesTyle'}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
