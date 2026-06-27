'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveSalesPopup() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Initial fetch
    fetchLatestActivity();

    // Subscribe to realtime
    const channel = supabase
      .channel('recent_activities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'recent_activities' },
        (payload) => {
          showNotification(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLatestActivity = async () => {
    const { data } = await supabase
      .from('recent_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      showNotification(data);
    }
  };

  const showNotification = (activity) => {
    setNotification(activity);
    setTimeout(() => {
      setNotification((current) => {
        if (current && current.id === activity.id) {
          return null;
        }
        return current;
      });
    }, 5000);
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-50 bg-white shadow-2xl rounded-2xl p-4 flex items-center gap-4 max-w-sm border border-gray-100"
        >
          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🛍️</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Achat récent</p>
            <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
