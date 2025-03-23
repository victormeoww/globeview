"use client"

import React, { useEffect } from "react"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { getCategoryColor } from "@/lib/utils"

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
  return L.divIcon({
    className: "custom-marker-icon",
    html: `
      <div class="marker-pulse" style="background-color: ${getCategoryColor(category)}"></div>
      <div class="marker-inner" style="background-color: ${getCategoryColor(category)}"></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
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