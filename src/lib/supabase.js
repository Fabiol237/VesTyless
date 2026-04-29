import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key'
);

const demoStores = [
  {
    id: 'demo-store-1',
    name: 'Maison Yara',
    slug: 'maison-yara',
    logo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&q=80',
    owner_id: 'demo-user-1',
    created_at: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'demo-store-2',
    name: 'Atelier Naya',
    slug: 'atelier-naya',
    logo_url: 'https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=300&q=80',
    owner_id: 'demo-user-1',
    created_at: '2026-04-02T10:00:00.000Z',
  },
  {
    id: 'demo-store-3',
    name: 'Bamenda Select',
    slug: 'bamenda-select',
    logo_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80',
    owner_id: 'demo-user-2',
    created_at: '2026-04-03T10:00:00.000Z',
  },
];

const demoProducts = [
  {
    id: 'demo-product-1',
    name: 'Sac cuir premium',
    price: 28000,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    is_active: true,
    created_at: '2026-04-05T10:00:00.000Z',
    stock_quantity: 12,
    category: 'Mode',
    store_id: 'demo-store-1',
    stores: { name: 'Maison Yara', slug: 'maison-yara' },
  },
  {
    id: 'demo-product-2',
    name: 'Sneakers urbaines',
    price: 35000,
    image_url: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=800&q=80',
    is_active: true,
    created_at: '2026-04-06T10:00:00.000Z',
    stock_quantity: 8,
    category: 'Chaussures',
    store_id: 'demo-store-2',
    stores: { name: 'Atelier Naya', slug: 'atelier-naya' },
  },
  {
    id: 'demo-product-3',
    name: 'Montre élégante',
    price: 22000,
    image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
    is_active: true,
    created_at: '2026-04-07T10:00:00.000Z',
    stock_quantity: 5,
    category: 'Accessoires',
    store_id: 'demo-store-3',
    stores: { name: 'Bamenda Select', slug: 'bamenda-select' },
  },
  {
    id: 'demo-product-4',
    name: 'Chemise lin premium',
    price: 18000,
    image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    is_active: true,
    created_at: '2026-04-08T10:00:00.000Z',
    stock_quantity: 16,
    category: 'Mode',
    store_id: 'demo-store-1',
    stores: { name: 'Maison Yara', slug: 'maison-yara' },
  },
  {
    id: 'demo-product-5',
    name: 'Parfum signature',
    price: 15000,
    image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    is_active: true,
    created_at: '2026-04-09T10:00:00.000Z',
    stock_quantity: 20,
    category: 'Beauté',
    store_id: 'demo-store-2',
    stores: { name: 'Atelier Naya', slug: 'atelier-naya' },
  },
  {
    id: 'demo-product-6',
    name: 'Lunettes soleil',
    price: 12000,
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    is_active: true,
    created_at: '2026-04-10T10:00:00.000Z',
    stock_quantity: 9,
    category: 'Accessoires',
    store_id: 'demo-store-3',
    stores: { name: 'Bamenda Select', slug: 'bamenda-select' },
  },
];

const demoProfiles = [
  {
    id: 'demo-user-1',
    full_name: 'Utilisateur Démo',
  },
];

  const getTableRows = (tableName) => {
    switch (tableName) {
      case 'stores':
        return [...demoStores];
      case 'products':
        return [...demoProducts];
      case 'profiles':
        return [...demoProfiles];
      case 'categories':
        return [
          { id: 'demo-cat-1', name: 'Mode' },
          { id: 'demo-cat-2', name: 'Beauté' },
          { id: 'demo-cat-3', name: 'Accessoires' },
        ];
      case 'delivery_tracking':
        // Return empty by default - positions come from the realtime simulation
        return [];
      default:
        return [];
    }
  };

const createMockQueryBuilder = (tableName) => {
  let rows = getTableRows(tableName);
  let isHeadCountQuery = false;
  let isSingleQuery = false;

  const builder = {
    select(_columns, options = {}) {
      isHeadCountQuery = Boolean(options?.head && options?.count);
      return builder;
    },
    eq(column, value) {
      rows = rows.filter((row) => row?.[column] === value);
      return builder;
    },
    order(column, { ascending = true } = {}) {
      rows = [...rows].sort((left, right) => {
        const leftValue = left?.[column];
        const rightValue = right?.[column];

        if (leftValue === rightValue) return 0;
        if (leftValue == null) return 1;
        if (rightValue == null) return -1;

        return ascending
          ? String(leftValue).localeCompare(String(rightValue))
          : String(rightValue).localeCompare(String(leftValue));
      });
      return builder;
    },
    limit(count) {
      rows = rows.slice(0, count);
      return builder;
    },
    single() {
      isSingleQuery = true;
      return builder;
    },
    insert(values) {
      const insertedRows = Array.isArray(values) ? values : [values];
      rows = insertedRows;
      return builder;
    },
    update(values) {
      rows = rows.map((row) => ({ ...row, ...values }));
      return builder;
    },
    delete() {
      rows = [];
      return builder;
    },
    channel() {
      return builder;
    },
    on() {
      return builder;
    },
    subscribe() {
      return builder;
    },
    then(resolve, reject) {
      const result = isHeadCountQuery
        ? { data: null, count: rows.length, error: null }
        : isSingleQuery
          ? {
              data: rows[0] ?? null,
              error: rows[0]
                ? null
                : { code: 'PGRST116', message: 'No rows found', details: null, hint: null },
            }
          : { data: rows, error: null };

      return Promise.resolve(result).then(resolve, reject);
    },
    catch(reject) {
      return Promise.resolve().catch(reject);
    },
    finally(handler) {
      return Promise.resolve().finally(handler);
    },
  };

  return builder;
};

const createMockSupabaseClient = () => {
  // Simulate real-time delivery tracking with smooth position updates
  const trackedChannels = new Map();
  const trackingIntervals = new Map();
  const deliveryPositions = new Map(); // orderId -> { lat, lng, progress }
  
  // Predefined route simulation: start -> customer with smooth interpolation
  const generatePositionUpdate = (orderId) => {
    const baseLat = 4.0511;
    const baseLng = 9.7679;
    
    if (!deliveryPositions.has(orderId)) {
      // Start position (slightly offset from customer)
      deliveryPositions.set(orderId, {
        lat: baseLat + 0.02 + Math.random() * 0.01,
        lng: baseLng + 0.015 + Math.random() * 0.01,
        progress: 0,
        speed: 0.00002 + Math.random() * 0.00002,
        targetLat: baseLat,
        targetLng: baseLng,
      });
    }
    
    const pos = deliveryPositions.get(orderId);
    pos.progress = Math.min(pos.progress + pos.speed + Math.random() * 0.000005, 1);
    
    // Smooth interpolation toward customer
    pos.lat = pos.lat + (pos.targetLat - pos.lat) * 0.008 + (Math.random() - 0.5) * 0.0002;
    pos.lng = pos.lng + (pos.targetLng - pos.lng) * 0.008 + (Math.random() - 0.5) * 0.0002;
    
    return {
      lat: parseFloat(pos.lat.toFixed(6)),
      lng: parseFloat(pos.lng.toFixed(6)),
      updated_at: new Date().toISOString(),
    };
  };
  
  const triggerRealtimeEvent = (channel, payload) => {
    const listeners = channel._listeners || [];
    listeners.forEach(listener => {
      try {
        // Wrap in next tick to simulate async realtime behavior
        Promise.resolve().then(() => listener(payload));
      } catch(e) {}
    });
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: 'Mode démo activé: Supabase non configuré.' },
      }),
      signUp: async () => ({
        data: { user: null, session: null },
        error: { message: 'Mode démo activé: Supabase non configuré.' },
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback) => {
        queueMicrotask(() => callback('INITIAL_SESSION', null));
        return { data: { subscription: { unsubscribe() {} } } };
      },
    },
    from: (tableName) => createMockQueryBuilder(tableName),
    channel: (topic) => {
      const channel = createMockQueryBuilder('delivery_tracking');
      channel._topic = topic;
      channel._listeners = [];
      trackedChannels.set(topic, channel);
      
      const origOn = channel.on;
      channel.on = function(event, filter, callback) {
        if (event === 'postgres_changes' && filter?.table === 'delivery_tracking') {
          channel._listeners.push(callback);
          // Start simulation for this order if not already running
          const orderId = filter?.filter?.match(/order_id=eq\.([^\s&]+)/)?.[1];
          if (orderId && !trackingIntervals.has(orderId)) {
            const interval = setInterval(() => {
              const update = generatePositionUpdate(orderId);
              triggerRealtimeEvent(channel, {
                eventType: 'INSERT',
                new: {
                  id: `tracking-${orderId}-${Date.now()}`,
                  order_id: orderId,
                  lat: update.lat,
                  lng: update.lng,
                  updated_at: update.updated_at,
                  status: 'in_transit',
                },
              });
            }, 2000 + Math.random() * 1000); // 2-3s updates
            trackingIntervals.set(orderId, interval);
          }
        }
        return channel;
      };
      
      const origSubscribe = channel.subscribe;
    channel.subscribe = function() {
      return this;
    };
      
      return channel;
    },
    removeChannel: (channel) => {
      if (channel?._topic) {
        trackedChannels.delete(channel._topic);
        const orderIdMatch = channel._topic.match(/tracking-([^\s]+)/);
        if (orderIdMatch) {
          const orderId = orderIdMatch[1];
          if (trackingIntervals.has(orderId)) {
            clearInterval(trackingIntervals.get(orderId));
            trackingIntervals.delete(orderId);
            deliveryPositions.delete(orderId);
          }
        }
      }
    },
  };
};

export const supabase = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient();
