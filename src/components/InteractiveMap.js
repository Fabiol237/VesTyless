'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

import RoutingMachine from './RoutingMachine';

// Helper for initial zoom/flyTo
function InitialZoom({ userPos, selectedStore }) {
  const map = useMap();
  useEffect(() => {
    if (map && typeof map.flyTo === 'function') {
      if (selectedStore && selectedStore.latitude) {
        // Zoom "à fond" - level 19 for maximum detail
        map.flyTo([selectedStore.latitude, selectedStore.longitude], 19, { animate: true, duration: 2.5 });
      } else if (userPos && !isNaN(userPos[0])) {
        map.flyTo(userPos, 18, { animate: true, duration: 2.5 });
      }
    }
  }, [userPos, selectedStore, map]);
  return null;
}

export default function InteractiveMap({ initialPos, stores = [], userPos, userAccuracy }) {
  const [selectedStore, setSelectedStore] = useState(null);
  const [isSatellite, setIsSatellite] = useState(true);
  const mapRef = useRef(null);

  const center = useMemo(() => initialPos || [4.0511, 9.7679], [initialPos]);

  return (
    <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl border-4 border-white group bg-slate-100">
      <MapContainer
        center={center}
        zoom={18}
        className="w-full h-full z-10"
        zoomControl={false}
        whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
      >
        <TileLayer
          url={isSatellite
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
          attribution='&copy; Esri &copy; OpenStreetMap'
        />

        <InitialZoom userPos={userPos} selectedStore={selectedStore} />

        {/* ITINERARY */}
        {selectedStore && userPos && !isNaN(userPos[0]) && (
          <RoutingMachine
            userPos={userPos}
            storePos={[Number(selectedStore.latitude), Number(selectedStore.longitude)]}
          />
        )}

        {/* STORES MARKERS */}
        {stores.map(store => (
          <Marker
            key={store.id}
            position={[Number(store.latitude), Number(store.longitude)]}
            eventHandlers={{
              click: () => setSelectedStore(store),
            }}
          >
            <Popup className="premium-popup">
              <div className="p-2 text-center min-w-[150px]">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl overflow-hidden border-2 border-wa-teal shadow-md bg-white">
                  <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-black text-slate-900 text-sm mb-1">{store.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{store.city}</p>
                <a href={`/boutique/${store.slug}`} className="block w-full py-2 bg-wa-teal text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-wa-teal/20">Visiter</a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* USER LOCATION */}
        {userPos && !isNaN(userPos[0]) && (
          <>
            <Circle center={userPos} radius={userAccuracy || 100} pathOptions={{ color: '#128C7E', fillColor: '#128C7E', fillOpacity: 0.1, weight: 1 }} />
            <Marker position={userPos} />
          </>
        )}
      </MapContainer>

      {/* OVERLAY CONTROLS */}
      <div className="absolute top-6 right-6 z-[100] flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setIsSatellite(!isSatellite)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all ${isSatellite ? 'bg-wa-teal text-white' : 'bg-white/80 backdrop-blur text-slate-900 hover:bg-white'}`}
          title="Vue Satellite"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6z" /></svg>
        </button>
      </div>

      {/* DISCOVERY MINI PANEL */}
      <div className="absolute bottom-6 left-6 right-6 z-[100] md:left-6 md:right-auto md:w-80">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-4 shadow-2xl border border-white/50">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Boutiques à proximité</h3>
            <span className="text-[10px] bg-wa-teal/10 text-wa-teal px-2 py-0.5 rounded-full font-black">{stores.length}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {stores.slice(0, 5).map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStore(s)}
                className={`shrink-0 w-14 h-14 rounded-2xl border-2 transition-all overflow-hidden bg-white ${selectedStore?.id === s.id ? 'border-wa-teal scale-110 shadow-lg shadow-wa-teal/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={s.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
