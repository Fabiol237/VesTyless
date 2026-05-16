'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
  // Inject pulse animation
  const sid = 'leaflet-vestyle-pulse';
  if (!document.getElementById(sid)) {
    const st = document.createElement('style');
    st.id = sid;
    st.textContent = `
      @keyframes vPulse{0%{transform:scale(1);opacity:.3}100%{transform:scale(3.5);opacity:0}}
      .user-loc-marker,.store-loc-marker{background:none!important;border:none!important}
      .leaflet-popup-content-wrapper{border-radius:20px!important;padding:0!important;box-shadow:0 8px 30px rgba(0,0,0,.12)!important}
      .leaflet-popup-tip{display:none!important}
    `;
    document.head.appendChild(st);
  }
}

const userIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'user-loc-marker',
  html: '<div style="position:relative;width:24px;height:24px"><div style="position:absolute;inset:0;background:#3B82F6;border-radius:50%;opacity:.25;animation:vPulse 2s ease-out infinite"></div><div style="position:absolute;inset:4px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,.5)"></div></div>',
  iconSize: [24, 24], iconAnchor: [12, 12],
}) : null;

const storeIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'store-loc-marker',
  html: '<div style="width:32px;height:38px;position:relative"><div style="width:32px;height:32px;background:linear-gradient(135deg,#128C7E,#25D366);border-radius:50% 50% 50% 4px;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(18,140,126,.4);display:flex;align-items:center;justify-content:center"><svg style="transform:rotate(45deg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M2 7h20"/></svg></div></div>',
  iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38],
}) : null;

function MapController({ userPos, selectedStore, ready }) {
  const map = useMap();
  const [initialZoomDone, setInitialZoomDone] = useState(false);

  useEffect(() => {
    if (!map || !ready) return;
    try {
      if (selectedStore?.latitude) {
        // Décalage pour ne pas que la boutique soit cachée par le panneau du bas
        const offsetLat = Number(selectedStore.latitude) - 0.0004;
        map.flyTo([offsetLat, Number(selectedStore.longitude)], 19, { animate: true, duration: 1.5 });
      } else if (userPos && !isNaN(userPos[0]) && !initialZoomDone) {
        map.flyTo(userPos, 19, { animate: true, duration: 2 });
        setInitialZoomDone(true);
      }
    } catch (_) {}
  }, [userPos, selectedStore, map, ready, initialZoomDone]);
  return null;
}

export default function InteractiveMap({ initialPos, stores = [], userPos, userAccuracy }) {
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isSatellite, setIsSatellite] = useState(true);
  const [ready, setReady] = useState(false);
  const [mapRef, setMapRef] = useState(null);

  const center = useMemo(() => {
    if (userPos && !isNaN(userPos[0])) return userPos;
    if (initialPos && !isNaN(initialPos[0])) return initialPos;
    return [4.0511, 9.7679];
  }, [initialPos, userPos]);

  const validStores = useMemo(() =>
    stores.filter(s => s.latitude && s.longitude && !isNaN(Number(s.latitude))),
    [stores]
  );

  const groupedStores = useMemo(() => {
    const groups = {};
    validStores.forEach(s => {
      // Group stores within roughly ~11 meters of each other (4 decimal places)
      const lat = Number(s.latitude).toFixed(4);
      const lng = Number(s.longitude).toFixed(4);
      const key = `${lat},${lng}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return Object.values(groups);
  }, [validStores]);

  const handleCenter = useCallback(() => {
    if (mapRef && userPos && !isNaN(userPos[0])) {
      mapRef.flyTo(userPos, 19, { animate: true, duration: 1.5 }); // Zoom total sur la position
    }
  }, [mapRef, userPos]);

  return (
    <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl border-4 border-white group bg-slate-100">
      <MapContainer
        center={center}
        zoom={15}
        className="w-full h-full z-10"
        zoomControl={false}
        ref={(r) => { if (r && !mapRef) { setMapRef(r); setReady(true); } }}
      >
        <TileLayer
          url={isSatellite
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
          attribution='&copy; Esri &copy; OpenStreetMap'
          maxZoom={20}
        />
        <MapController userPos={userPos} selectedStore={selectedStore} ready={ready} />

        {groupedStores.map((group, idx) => {
          if (group.length === 1) {
            const store = group[0];
            return (
              <Marker key={store.id} position={[Number(store.latitude), Number(store.longitude)]} icon={storeIcon} zIndexOffset={1000} eventHandlers={{ 
                click: () => { setSelectedStore(store); setSelectedGroup(null); } 
              }} />
            );
          } else {
            const multiIcon = L.divIcon({
              className: 'multi-store-marker',
              html: `<div style="width:36px;height:36px;background:#10B981;border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(16,185,129,0.5);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:14px;z-index:999;">${group.length}</div>`,
              iconSize: [36, 36], iconAnchor: [18, 18]
            });
            return (
              <Marker key={`group-${idx}`} position={[Number(group[0].latitude), Number(group[0].longitude)]} icon={multiIcon} zIndexOffset={1000} eventHandlers={{ 
                click: () => { setSelectedGroup(group); setSelectedStore(null); mapRef?.flyTo([Number(group[0].latitude) - 0.0004, Number(group[0].longitude)], 19, { animate: true, duration: 1 }); } 
              }} />
            );
          }
        })}

        {userPos && !isNaN(userPos[0]) && (
          <>
            <Circle center={userPos} radius={userAccuracy || 80} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.08, weight: 1.5, dashArray: '6 4' }} />
            <Marker position={userPos} icon={userIcon} zIndexOffset={-1000}>
              <Popup>
                <div className="p-3 text-center">
                  <p className="font-black text-slate-900 text-xs">📍 Vous êtes ici</p>
                  <p className="text-[10px] text-slate-400">~{Math.round(userAccuracy || 80)}m</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Controls Outside MapContainer overlaying - Centered Vertically to avoid hiding stores */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-[100] flex flex-col gap-3">
        <button type="button" onClick={() => setIsSatellite(!isSatellite)} className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all ${isSatellite ? 'bg-emerald-600 text-white border-2 border-emerald-500' : 'bg-white/90 backdrop-blur text-slate-900 border-2 border-transparent'}`} title="Vue">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        </button>
        {userPos && !isNaN(userPos[0]) && (
          <button type="button" onClick={handleCenter} className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl bg-white hover:bg-blue-50 text-blue-600 border-2 border-transparent hover:border-blue-500 active:scale-90 transition-all" title="Ma position">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>
          </button>
        )}
        
        <div className="flex flex-col gap-2 mt-2">
          <button type="button" onClick={() => mapRef?.zoomIn()} className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl bg-white/90 backdrop-blur hover:bg-white text-slate-900 font-black text-2xl active:scale-90 transition-all border-2 border-transparent hover:border-emerald-500" title="Zoom +">+</button>
          <button type="button" onClick={() => mapRef?.zoomOut()} className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl bg-white/90 backdrop-blur hover:bg-white text-slate-900 font-black text-3xl active:scale-90 transition-all border-2 border-transparent hover:border-emerald-500 pb-1" title="Zoom -">-</button>
        </div>
      </div>

      {/* Bottom panel for SINGLE Store */}
      {selectedStore && (
        <div className="absolute bottom-6 left-4 right-4 z-[100] md:left-6 md:right-auto md:w-96 animate-in slide-in-from-bottom-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-5 shadow-2xl border border-white relative">
            <button 
              onClick={() => setSelectedStore(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-emerald-500 overflow-hidden bg-white shadow-lg shrink-0">
                <img src={selectedStore.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover" alt={selectedStore.name} />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="font-black text-slate-900 text-lg truncate">{selectedStore.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{selectedStore.city}</p>
              </div>
            </div>
            
            <div className="mt-5 flex gap-2">
              <a 
                href={`/boutique/${selectedStore.slug}`} 
                className="flex-1 py-3.5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-colors text-center flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                Boutique
              </a>
              
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.latitude},${selectedStore.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-colors text-center flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                Itinéraire
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Bottom panel for MULTIPLE Stores (Group) */}
      {selectedGroup && (
        <div className="absolute bottom-6 left-4 right-4 z-[100] md:left-6 md:right-auto md:w-96 animate-in slide-in-from-bottom-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-5 shadow-2xl border border-white relative max-h-[60vh] overflow-hidden flex flex-col">
            <button 
              onClick={() => setSelectedGroup(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-all z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-4 pr-6">
              {selectedGroup.length} Boutiques ici
            </h3>
            <div className="overflow-y-auto no-scrollbar flex-1 flex flex-col gap-3 pb-2">
              {selectedGroup.map(store => (
                <button key={store.id} onClick={() => { setSelectedStore(store); setSelectedGroup(null); }} className="flex items-center gap-4 p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100 text-left w-full group">
                  <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 group-hover:border-emerald-500 transition-colors">
                    <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover" alt={store.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 text-sm truncate group-hover:text-emerald-700 transition-colors">{store.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{store.city}</p>
                  </div>
                  <div className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
