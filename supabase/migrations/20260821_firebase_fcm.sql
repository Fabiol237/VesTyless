-- ─── Migration: Firebase FCM Tokens & Notification Logs ──────────────────────
-- À exécuter dans Supabase SQL Editor

-- Table des tokens FCM (un par appareil/navigateur)
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  token      text NOT NULL UNIQUE,
  store_id   uuid REFERENCES stores(id) ON DELETE SET NULL,
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id   ON fcm_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_store_id  ON fcm_tokens (store_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_active     ON fcm_tokens (is_active);

-- Table des logs de notifications envoyées
CREATE TABLE IF NOT EXISTS notification_logs (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  store_id     uuid REFERENCES stores(id)    ON DELETE SET NULL,
  title        text NOT NULL,
  body         text,
  tokens_count integer DEFAULT 1,
  success      boolean DEFAULT false,
  sent_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_logs_store_id ON notification_logs (store_id);
CREATE INDEX IF NOT EXISTS idx_notif_logs_sent_at  ON notification_logs (sent_at DESC);

-- RLS: Les utilisateurs ne voient que leurs propres tokens
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own FCM tokens" ON fcm_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Service role peut tout faire (pour les APIs serveur)
CREATE POLICY "Service role full access fcm_tokens" ON fcm_tokens
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access notif_logs" ON notification_logs
  FOR ALL USING (auth.role() = 'service_role');
