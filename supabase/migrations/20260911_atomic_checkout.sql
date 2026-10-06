-- ─────────────────────────────────────────────────────────────────────────────
-- Vestin / VeStyle — Étape 5.0 : Commerce Transaction Engine
-- Migration : Idempotency + RPC process_order_checkout (atomique)
-- À exécuter dans Supabase SQL Editor
-- Idempotente : tous les CREATE/ALTER utilisent IF NOT EXISTS / OR REPLACE
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. IDEMPOTENCY KEY sur la table orders ───────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Index UNIQUE partiel : couvre uniquement les lignes non-NULL
-- La contrainte UNIQUE PostgreSQL est l'autorité finale contre la concurrence
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ── 2. RPC TRANSACTIONNELLE : process_order_checkout ─────────────────────────
-- Paramètres :
--   p_store_id        UUID   — boutique cible
--   p_items           JSONB  — [{product_id, quantity}]
--   p_customer        JSONB  — {name, phone, address, lat, lng}
--   p_delivery_fee    NUMERIC — calculé côté serveur Next.js
--   p_idempotency_key TEXT   — clé unique par tentative de checkout
--
-- Retour :
--   JSONB avec { order_id, status, total_amount, idempotent_replay }
--
-- SÉCURITÉ :
--   SECURITY DEFINER avec search_path verrouillé
--   Les quantités sont re-validées côté SQL
--   Le prix est exclusivement issu de products.price (jamais du client)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.process_order_checkout(
  p_store_id         UUID,
  p_items            JSONB,
  p_customer         JSONB,
  p_delivery_fee     NUMERIC,
  p_idempotency_key  TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store            RECORD;
  v_product          RECORD;
  v_item             JSONB;
  v_product_id       UUID;
  v_quantity         INT;
  v_subtotal         NUMERIC := 0;
  v_total            NUMERIC;
  v_order_id         UUID;
  v_existing_order   RECORD;
  v_order_items      JSONB  := '[]'::JSONB;
  v_current_stock    INT;
  v_before_qty       INT;
  v_after_qty        INT;
  v_product_ids      UUID[];
  v_item_obj         JSONB;
BEGIN
  -- ── GARDE-FOU : quantité nulle ou négative ──────────────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INT;
    IF v_quantity IS NULL OR v_quantity <= 0 OR v_quantity > 10000 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY: %', (v_item->>'product_id');
    END IF;
  END LOOP;

  -- ── IDEMPOTENCE : Vérification avant tout verrou ─────────────────────────
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id, total_amount, status
    INTO v_existing_order
    FROM public.orders
    WHERE idempotency_key = p_idempotency_key
    LIMIT 1;

    IF FOUND THEN
      -- Replay idempotent : retourner la commande existante sans rien modifier
      RETURN jsonb_build_object(
        'order_id',         v_existing_order.id,
        'total_amount',     v_existing_order.total_amount,
        'status',           v_existing_order.status,
        'idempotent_replay', TRUE
      );
    END IF;
  END IF;

  -- ── VÉRIFICATION BOUTIQUE ────────────────────────────────────────────────
  SELECT id, is_active, allow_out_of_stock, min_order_amount, currency
  INTO v_store
  FROM public.stores
  WHERE id = p_store_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'STORE_NOT_FOUND: %', p_store_id;
  END IF;

  IF v_store.is_active = FALSE THEN
    RAISE EXCEPTION 'STORE_INACTIVE: %', p_store_id;
  END IF;

  -- ── COLLECTE DES PRODUCT IDs (pour verrouillage déterministe) ────────────
  SELECT array_agg((elem->>'product_id')::UUID ORDER BY (elem->>'product_id')::UUID)
  INTO v_product_ids
  FROM jsonb_array_elements(p_items) AS elem;

  -- ── VERROUILLAGE PESSIMISTE DES LIGNES PRODUIT ───────────────────────────
  -- ORDER BY id garantit un ordre déterministe anti-deadlock
  -- FOR UPDATE verrouille les lignes jusqu'au COMMIT/ROLLBACK
  PERFORM id
  FROM public.products
  WHERE id = ANY(v_product_ids)
  ORDER BY id
  FOR UPDATE;

  -- ── VALIDATION ET CALCUL DU TOTAL ────────────────────────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INT;

    -- Lecture des données fraîches post-verrou
    SELECT id, name, price, stock_quantity, is_active, moq, store_id, image_url, category
    INTO v_product
    FROM public.products
    WHERE id = v_product_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND: %', v_product_id;
    END IF;

    -- Vérification appartenance à la boutique
    IF v_product.store_id != p_store_id THEN
      RAISE EXCEPTION 'PRODUCT_WRONG_STORE: %', v_product_id;
    END IF;

    -- Vérification is_active
    IF v_product.is_active = FALSE THEN
      RAISE EXCEPTION 'PRODUCT_INACTIVE: %', v_product_id;
    END IF;

    -- Vérification MOQ
    IF v_quantity < COALESCE(v_product.moq, 1) THEN
      RAISE EXCEPTION 'MOQ_NOT_MET: %', v_product_id;
    END IF;

    -- Vérification stock
    v_current_stock := COALESCE(v_product.stock_quantity, 0);
    IF v_current_stock < v_quantity AND NOT COALESCE(v_store.allow_out_of_stock, FALSE) THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK: %', v_product_id;
    END IF;

    -- Accumulation du sous-total (prix SERVEUR uniquement)
    v_subtotal := v_subtotal + (v_product.price * v_quantity);

    -- Construction de l'item de commande (JSONB)
    v_item_obj := jsonb_build_object(
      'id',       v_product.id,
      'name',     v_product.name,
      'price',    v_product.price,
      'quantity', v_quantity,
      'image',    COALESCE(v_product.image_url, ''),
      'category', COALESCE(v_product.category, 'Général')
    );
    v_order_items := v_order_items || jsonb_build_array(v_item_obj);
  END LOOP;

  -- Total final = sous-total + frais de livraison (calculé en JS, passé en paramètre)
  v_total := v_subtotal + COALESCE(p_delivery_fee, 0);

  -- Vérification montant minimum boutique
  IF COALESCE(v_store.min_order_amount, 0) > 0 AND v_subtotal < v_store.min_order_amount THEN
    RAISE EXCEPTION 'MIN_ORDER_AMOUNT: % required, % provided',
      v_store.min_order_amount, v_subtotal;
  END IF;

  -- ── CRÉATION DE LA COMMANDE ───────────────────────────────────────────────
  INSERT INTO public.orders (
    store_id,
    customer_name,
    customer_phone,
    shipping_address,
    total_amount,
    order_items,
    delivery_lat,
    delivery_lng,
    status,
    idempotency_key
  )
  VALUES (
    p_store_id,
    trim(p_customer->>'name'),
    regexp_replace(COALESCE(p_customer->>'phone', ''), '[^0-9]', '', 'g'),
    COALESCE(trim(p_customer->>'address'), NULL),
    v_total,
    v_order_items,
    CASE WHEN p_customer->>'lat' IS NOT NULL AND p_customer->>'lat' != 'null'
         THEN (p_customer->>'lat')::NUMERIC ELSE NULL END,
    CASE WHEN p_customer->>'lng' IS NOT NULL AND p_customer->>'lng' != 'null'
         THEN (p_customer->>'lng')::NUMERIC ELSE NULL END,
    'pending',
    p_idempotency_key
  )
  RETURNING id INTO v_order_id;

  -- ── DÉCRÉMENTATION DES STOCKS + STOCK_LOGS ───────────────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INT;

    -- Lecture du stock actuel (lignes déjà verrouillées)
    SELECT stock_quantity, store_id
    INTO v_product
    FROM public.products
    WHERE id = v_product_id;

    v_before_qty := COALESCE(v_product.stock_quantity, 0);

    -- Décrémentation sécurisée (ne peut pas aller en-dessous de 0)
    UPDATE public.products
    SET stock_quantity = GREATEST(0, stock_quantity - v_quantity),
        updated_at     = NOW()
    WHERE id = v_product_id;

    v_after_qty := GREATEST(0, v_before_qty - v_quantity);

    -- Écriture du mouvement de stock (dans la même transaction)
    INSERT INTO public.stock_logs (
      product_id,
      store_id,
      type,
      quantity,
      before_qty,
      after_qty,
      note
    )
    VALUES (
      v_product_id,
      p_store_id,
      'remove',
      v_quantity,
      v_before_qty,
      v_after_qty,
      'checkout order ' || v_order_id::TEXT
    );
  END LOOP;

  -- ── SUCCÈS : Retour des données de commande ───────────────────────────────
  RETURN jsonb_build_object(
    'order_id',          v_order_id,
    'total_amount',      v_total,
    'subtotal',          v_subtotal,
    'delivery_fee',      COALESCE(p_delivery_fee, 0),
    'status',            'pending',
    'idempotent_replay', FALSE
  );

EXCEPTION
  WHEN unique_violation THEN
    -- Race condition sur idempotency_key : une autre transaction a déjà inséré avec cette clé
    -- Récupérer proprement la commande existante
    SELECT id, total_amount, status
    INTO v_existing_order
    FROM public.orders
    WHERE idempotency_key = p_idempotency_key
    LIMIT 1;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'order_id',          v_existing_order.id,
        'total_amount',      v_existing_order.total_amount,
        'status',            v_existing_order.status,
        'idempotent_replay', TRUE
      );
    END IF;
    -- Si pas trouvé (edge case extrême), propager l'erreur originale
    RAISE;
END;
$$;

-- ── 3. PERMISSIONS ───────────────────────────────────────────────────────────
-- Révoquer l'accès public par défaut
REVOKE EXECUTE ON FUNCTION public.process_order_checkout(UUID, JSONB, JSONB, NUMERIC, TEXT)
  FROM PUBLIC;

-- Donner accès uniquement au service_role (utilisé par supabaseAdmin côté serveur)
GRANT EXECUTE ON FUNCTION public.process_order_checkout(UUID, JSONB, JSONB, NUMERIC, TEXT)
  TO service_role;

-- ── 4. COMMENTAIRE DOCUMENTATION ─────────────────────────────────────────────
COMMENT ON FUNCTION public.process_order_checkout IS
  'Étape 5.0 — Commerce Transaction Engine. Checkout atomique et idempotent : '
  'verrouillage FOR UPDATE, validation stock, création commande, décrémentation stock, '
  'écriture stock_logs, gestion de la race condition sur idempotency_key.';
