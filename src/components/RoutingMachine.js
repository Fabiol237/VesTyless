'use client';
import L from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
import "leaflet-routing-machine";

const createRoutineMachineLayer = ({ userPos, storePos }) => {
  if (!userPos || !storePos) return null;
  
  const instance = L.Routing.control({
    waypoints: [
      L.latLng(userPos[0], userPos[1]),
      L.latLng(storePos[0], storePos[1])
    ],
    lineOptions: {
      styles: [{ color: "#128C7E", weight: 6, opacity: 0.8 }]
    },
    show: false,
    addWaypoints: false,
    routeWhileDragging: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: false,
    createMarker: () => null // Hide default markers to use our premium ones
  });

  return instance;
};

const RoutingMachine = createControlComponent(createRoutineMachineLayer);

export default RoutingMachine;
