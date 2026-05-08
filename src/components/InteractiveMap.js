'use client';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Component to re-center map when position changes externally
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && !Number.isNaN(position[0]) && !Number.isNaN(position[1])) {
      map.flyTo(position, 18, { animate: true, duration: 2 });
    }
  }, [map, position]);
  return null;
}

// Custom DivIcons using SVG strings to avoid external asset dependencies
const getStoreIcon = () => {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    className: 'custom-store-marker',
    html: `<div style="background-color: #128C7E; width: 40px; height: 40px; border-radius: 14px; border: 3px solid white; box-shadow: 0 10px 20px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

const getUserIcon = () => {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 15px rgba(59,130,246,0.5); display: flex; align-items: center; justify-content: center; color: white; animation: pulse 2s infinite;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v2m0 16v2M2 12h2m16 0h2"></path></svg>
      <style>@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }</style>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Routing Component
function RoutingMachine({ userPos, storePos }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    if (!map || !userPos || !storePos || !L.Routing) return;

    try {
      if (routingControlRef.current) {
        try {
          routingControlRef.current.setWaypoints([]);
          map.removeControl(routingControlRef.current);
        } catch (e) { }
      }

      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userPos[0], userPos[1]),
          L.latLng(storePos[0], storePos[1])
        ],
        lineOptions: {
          styles: [{ color: '#128C7E', weight: 6, opacity: 0.8 }]
        },
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: () => null,
      }).on('routesfound', (e) => {
        const routes = e.routes;
        const summary = routes[0].summary;
        setRouteInfo({
          distance: (summary.totalDistance / 1000).toFixed(1),
          duration: Math.round(summary.totalTime / 60),
          error: null
        });
      }).on('routingerror', (err) => {
        console.error("Détail erreur routage:", err);
        setRouteInfo({ error: "Itinéraire impossible" });
      }).addTo(map);

      return () => {
        if (routingControlRef.current && map) {
          try {
            if (routingControlRef.current.setWaypoints) {
              routingControlRef.current.setWaypoints([]);
            }
            if (map._container && map.removeControl) {
              map.removeControl(routingControlRef.current);
            }
          } catch (e) { }
        }
        routingControlRef.current = null;
      };
    } catch (e) {
      console.error("Leaflet Routing Machine Error:", e);
    }
  }, [map, userPos, storePos]);

  if (!routeInfo) return null;

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white flex flex-col gap-1 min-w-[140px] animate-fade-in">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itinéraire</p>
      {routeInfo.error ? (
        <div className="flex items-center gap-2 text-rose-500 mt-1">
          <span className="text-xs font-black uppercase tracking-tight">{routeInfo.error}</span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <span className="text-xl font-black text-slate-900">{routeInfo.distance} km</span>
          <span className="text-xs font-bold text-wa-teal bg-wa-teal/10 px-2 py-1 rounded-lg">~{routeInfo.duration} min</span>
        </div>
      )}
    </div>
  );
}

// Click Handler for Selection Mode
function LocationMarker({ position, setPosition, isSelectable }) {
  const map = useMapEvents({
    click(e) {
      if (isSelectable) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  if (!position || isNaN(position[0]) || isNaN(position[1])) return null;

  return (
    <Marker
      position={position}
      draggable={isSelectable}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        },
      }}
      icon={getStoreIcon()}
    >
      <Popup>Position de la boutique</Popup>
    </Marker>
  );
}

export default function InteractiveMap({
  initialPos,
  userPos,
  onPositionChange,
  mode = 'view',
  showSatellite = true,
  stores = [],
  userAccuracy = null
}) {
  const [position, setPosition] = useState(initialPos || [4.0511, 9.7679]);
  const [mapType, setMapType] = useState(showSatellite ? 'satellite' : 'osm');
  const [isReady, setIsReady] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null); // { pos, name }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet-routing-machine').then(() => {
        setIsReady(true);
      }).catch(err => {
        console.error("Failed to load leaflet-routing-machine", err);
        setIsReady(true);
      });
    }
  }, []);

  useEffect(() => {
    if (initialPos && !isNaN(initialPos[0]) && !isNaN(initialPos[1])) {
      setPosition(initialPos);
    }
  }, [initialPos]);

  const handlePositionUpdate = (newPos) => {
    setPosition(newPos);
    if (onPositionChange) onPositionChange(newPos);
  };

  return (
    <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-inner bg-slate-100 border-2 border-slate-100 group">

      {/* Premium Map Controls (Top) */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          {activeRoute && (
            <button
              onClick={() => setActiveRoute(null)}
              className="px-4 py-2.5 bg-rose-500 text-white rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest border-2 border-white flex items-center gap-2"
            >
              ❌ Annuler l&apos;itinéraire
            </button>
          )}
        </div>
      </div>

      {/* Map Style Toggle (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-[1000] pointer-events-auto">
        <button
          onClick={() => setMapType(mapType === 'osm' ? 'satellite' : 'osm')}
          className="px-6 py-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl text-slate-900 hover:bg-wa-teal hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.1em] border-2 border-white flex items-center gap-3 active:scale-95"
        >
          {mapType === 'osm' ? (
            <><span className="text-lg">🛰️</span> Vue Satellite</>
          ) : (
            <><span className="text-lg">🗺️</span> Vue Plan</>
          )}
        </button>
      </div>



      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <RecenterMap position={position} />
        {mapType === 'osm' ? (
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='Esri World Imagery'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* User Marker & Accuracy Circle */}
        {userPos && !isNaN(userPos[0]) && (
          <>
            <Marker position={userPos} icon={getUserIcon()}>
              <Popup>
                <div className="text-center font-black text-xs text-slate-900">Ma position</div>
                {userAccuracy && <div className="text-[10px] text-slate-500">Précision: {Math.round(userAccuracy)}m</div>}
              </Popup>
            </Marker>
            {userAccuracy && (
              <Circle
                center={userPos}
                radius={userAccuracy}
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  color: '#3b82f6',
                  weight: 1,
                  dashArray: '5, 10'
                }}
              />
            )}
          </>
        )}

        {/* Mode: Selection or View Single Store */}
        {mode !== 'route' && stores.length === 0 && (
          <LocationMarker
            position={position}
            setPosition={handlePositionUpdate}
            isSelectable={mode === 'select'}
          />
        )}

        {/* Mode: Multiple Stores Discovery */}
        {stores.length > 0 && !activeRoute && stores.map(store => (
          store.latitude && store.longitude && (
            <Marker
              key={store.id}
              position={[Number(store.latitude), Number(store.longitude)]}
              icon={getStoreIcon()}
            >
              <Popup>
                <div className="p-1 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-50 border border-slate-100">
                    <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 leading-tight">{store.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{store.city || 'Douala'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveRoute({ pos: [Number(store.latitude), Number(store.longitude)], name: store.name })}
                      className="px-4 py-2 bg-wa-teal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                    >
                      Y aller
                    </button>
                    <a
                      href={`/boutique/${store.slug}`}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                      Voir
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* Mode: Route Planning (Explicit or from Discovery) */}
        {(mode === 'route' || activeRoute) && userPos && isReady && !isNaN(userPos[0]) && (
          <>
            <RoutingMachine
              userPos={userPos}
              storePos={activeRoute ? activeRoute.pos : position}
            />
            {activeRoute && (
              <Marker position={activeRoute.pos} icon={getStoreIcon()}>
                <Popup>
                  <div className="text-center font-black text-xs text-slate-900">{activeRoute.name}</div>
                </Popup>
              </Marker>
            )}
            {!activeRoute && <LocationMarker position={position} isSelectable={false} />}
          </>
        )}
      </MapContainer>

      {mode === 'select' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-wa-teal text-white px-8 py-3 rounded-full shadow-2xl font-black text-[10px] uppercase tracking-[0.2em] animate-bounce whitespace-nowrap">
          📍 Déplacez le marqueur pour plus de précision
        </div>
      )}
    </div>
  );
}
