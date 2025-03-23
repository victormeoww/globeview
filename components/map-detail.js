"use client"

import React, { useEffect } from "react"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { getCategoryColor, getCategoryIcon } from "@/lib/utils"

// Fix for Leaflet marker icons in Next.js
const fixLeafletIcons = () => {
  // Only run on client side
  if (typeof window !== "undefined") {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
  }
}

// Custom marker icon creator
const createCustomIcon = (category) => {
  const normalizedCategory = category?.toLowerCase() || 'other';
  const color = getCategoryColor(normalizedCategory);
  const iconName = getCategoryIcon(normalizedCategory);
  
  return L.divIcon({
    className: "custom-marker-icon",
    html: `
      <div class="marker-container">
        <div class="marker-pulse" style="background-color: ${color}; opacity: 0.4;"></div>
        <div class="marker-outer" style="background-color: rgba(10, 14, 20, 0.8); border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);">
          <i class="fa-solid fa-${iconName}" style="color: ${color}; font-size: 12px;"></i>
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function MapDetail({ event }) {
  useEffect(() => {
    // Fix Leaflet icons on component mount
    fixLeafletIcons()
    
    // Apply custom CSS to remove dark tint
    const customCSS = `
      .leaflet-tile {
        filter: brightness(1.05) contrast(1.05) !important;
      }
      .leaflet-container {
        background: transparent !important;
      }
    `;
    
    // Insert custom CSS
    const style = document.createElement('style');
    style.innerHTML = customCSS;
    document.head.appendChild(style);
    
    return () => {
      if (style && document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [])

  return (
    <MapContainer
      center={[event.location.lat, event.location.lng]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      className="dark-tiles"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[event.location.lat, event.location.lng]} icon={createCustomIcon(event.category)} />
    </MapContainer>
  )
}

export default MapDetail 