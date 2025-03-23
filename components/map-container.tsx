"use client"

import { useState, forwardRef, useEffect } from "react"
import dynamic from 'next/dynamic'
import type { Event } from "@/lib/types"
import { getCategoryColor } from "@/lib/utils"

// Available map styles for Leaflet (2D)
const leafletMapStyles = [
  { 
    id: "standard", 
    name: "Standard", 
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  { 
    id: "dark", 
    name: "Dark", 
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
  },
  { 
    id: "satellite", 
    name: "Satellite", 
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
  },
  { 
    id: "terrain", 
    name: "Terrain", 
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
  }
];

// Available map styles for Mapbox (3D)
const mapboxMapStyles = [
  {
    id: "satellite",
    name: "Satellite",
    url: "mapbox://styles/mapbox/satellite-v9",
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  },
  {
    id: "satellite-streets",
    name: "Satellite Streets",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  },
  {
    id: "outdoors",
    name: "Terrain",
    url: "mapbox://styles/mapbox/outdoors-v12",
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  },
  {
    id: "dark",
    name: "Dark",
    url: "mapbox://styles/mapbox/dark-v11",
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  },
  {
    id: "light",
    name: "Light",
    url: "mapbox://styles/mapbox/light-v11",
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  },
  {
    id: "streets",
    name: "Streets",
    url: "mapbox://styles/mapbox/streets-v12",
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  },
  {
    id: "navigation-day",
    name: "Navigation Day",
    url: "mapbox://styles/mapbox/navigation-day-v1",
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  },
  {
    id: "navigation-night",
    name: "Navigation Night",
    url: "mapbox://styles/mapbox/navigation-night-v1",
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  }
];

// Dynamically import Leaflet components with no SSR
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0a0e14]">
      <div className="text-[#8c95a6]">Loading map...</div>
    </div>
  ),
});

// Dynamically import Mapbox 3D Globe with no SSR
const MapboxMap = dynamic(() => import("./mapbox-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0a0e14]">
      <div className="text-[#8c95a6]">Loading 3D globe...</div>
    </div>
  ),
});

interface MapContainerProps {
  events: Event[]
  onEventClick: (event: Event) => void
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  counters: {
    conflict: number
    security: number
    economy: number
    diplomacy: number
    humanitarian: number
  }
  focusedEventId: number | null
}

const MapContainer = forwardRef(({
  events,
  onEventClick,
  leftSidebarOpen,
  rightSidebarOpen,
  counters,
  focusedEventId
}: MapContainerProps, ref) => {
  // Default to 3D mode and set appropriate default style for each mode
  const [is3DMode, setIs3DMode] = useState(true)
  const [selectedLeafletStyle, setSelectedLeafletStyle] = useState(leafletMapStyles[1]) // Dark for 2D
  const [selectedMapboxStyle, setSelectedMapboxStyle] = useState(mapboxMapStyles[0]) // Satellite for 3D
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    console.log("Map container rendering, 3D mode:", is3DMode);
  }, [is3DMode]);

  return (
    <div className="map-container flex-1 relative bg-[#0a0e14] overflow-hidden h-full flex">
      {is3DMode ? (
        <MapboxMap 
          events={events} 
          onEventClick={onEventClick} 
          mapStyle={selectedMapboxStyle}
          focusedEventId={focusedEventId}
          mapRef={ref}
          fitBoundsOnLoad={true}
          fitBoundsOnUpdate={false}
          enableTerrain={selectedMapboxStyle.id === "outdoors" || selectedMapboxStyle.id === "satellite-streets"}
        />
      ) : (
        <LeafletMap 
          events={events} 
          onEventClick={onEventClick} 
          mapStyle={selectedLeafletStyle}
          focusedEventId={focusedEventId}
          mapRef={ref}
          fitBoundsOnLoad={true}
          fitBoundsOnUpdate={false}
        />
      )}

      {/* Map view mode selector - ALWAYS VISIBLE */}
      {showControls && (
        <div className="map-view-mode-selector absolute top-4 right-2 z-[1001] bg-[#141a24] border border-[#2a3548] rounded-md p-2">
          <div className="text-xs font-medium mb-2">MAP VIEW</div>
          <div className="flex flex-col gap-1">
            <button
              className={`text-xs py-1 px-2 rounded ${!is3DMode 
                ? 'bg-[#3a7bd5] text-white' 
                : 'bg-[#1c2433] text-[#8c95a6] hover:bg-[#232d3f]'}`}
              onClick={() => setIs3DMode(false)}
              title="Switch to 2D map view"
            >
              2D Map
            </button>
            <button
              className={`text-xs py-1 px-2 rounded ${is3DMode 
                ? 'bg-[#3a7bd5] text-white' 
                : 'bg-[#1c2433] text-[#8c95a6] hover:bg-[#232d3f]'}`}
              onClick={() => {
                console.log("3D Globe button clicked");
                setIs3DMode(true);
              }}
              title="Switch to 3D globe view"
            >
              3D Globe
            </button>
          </div>
        </div>
      )}

      {/* Map style selector - different options based on 2D/3D mode */}
      <div className="map-style-selector absolute top-24 right-2 z-[1001] bg-[#141a24] border border-[#2a3548] rounded-md p-2">
        <div className="text-xs font-medium mb-2">MAP STYLE</div>
        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
          {is3DMode ? (
            // Show Mapbox styles for 3D mode
            mapboxMapStyles.map(style => (
              <button
                key={style.id}
                className={`text-xs py-1 px-2 rounded ${selectedMapboxStyle.id === style.id 
                  ? 'bg-[#3a7bd5] text-white' 
                  : 'bg-[#1c2433] text-[#8c95a6] hover:bg-[#232d3f]'}`}
                onClick={() => setSelectedMapboxStyle(style)}
                title={`Switch to ${style.name} map style`}
              >
                {style.name}
              </button>
            ))
          ) : (
            // Show Leaflet styles for 2D mode
            leafletMapStyles.map(style => (
              <button
                key={style.id}
                className={`text-xs py-1 px-2 rounded ${selectedLeafletStyle.id === style.id 
                  ? 'bg-[#3a7bd5] text-white' 
                  : 'bg-[#1c2433] text-[#8c95a6] hover:bg-[#232d3f]'}`}
                onClick={() => setSelectedLeafletStyle(style)}
                title={`Switch to ${style.name} map style`}
              >
                {style.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Map legend with lower z-index */}
      <div className="map-legend absolute left-4 bottom-4 bg-[#141a24] border border-[#2a3548] rounded-md p-3 z-[900]">
        <h4 className="text-xs font-medium mb-2">EVENT CATEGORIES</h4>
        <div className="grid grid-cols-1 gap-1">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#e63946] mr-2"></span>
            <span className="text-xs">Conflict & War</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#f7a440] mr-2"></span>
            <span className="text-xs">Security & Intelligence</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#2ecc71] mr-2"></span>
            <span className="text-xs">Economy & Trade</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#3a7bd5] mr-2"></span>
            <span className="text-xs">Diplomacy</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#9b59b6] mr-2"></span>
            <span className="text-xs">Politics</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#e74c3c] mr-2"></span>
            <span className="text-xs">Humanitarian</span>
          </div>
        </div>
      </div>

      {/* Global hotspots with lower z-index */}
      <div className="global-hotspots absolute left-4 top-4 bg-[#141a24] border border-[#2a3548] rounded-md p-3 max-w-xs z-[900]">
        <h4 className="text-xs font-medium mb-2">GLOBAL HOTSPOTS</h4>
        <div className="grid grid-cols-1 gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-[#e63946] mr-1">▲</span>
              <span className="text-xs">Eastern Europe</span>
            </div>
            <span className="text-xs font-mono bg-[#e63946] bg-opacity-20 text-[#e63946] px-1 rounded">CRITICAL</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-[#f7a440] mr-1">▲</span>
              <span className="text-xs">South China Sea</span>
            </div>
            <span className="text-xs font-mono bg-[#f7a440] bg-opacity-20 text-[#f7a440] px-1 rounded">HIGH</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-[#f7a440] mr-1">▲</span>
              <span className="text-xs">Middle East</span>
            </div>
            <span className="text-xs font-mono bg-[#f7a440] bg-opacity-20 text-[#f7a440] px-1 rounded">ELEVATED</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-[#2ecc71] mr-1">▲</span>
              <span className="text-xs">Horn of Africa</span>
            </div>
            <span className="text-xs font-mono bg-[#2ecc71] bg-opacity-20 text-[#2ecc71] px-1 rounded">MODERATE</span>
          </div>
        </div>
      </div>

      {/* Active incidents with lower z-index */}
      <div className="active-incidents absolute right-4 bottom-4 bg-[#141a24] border border-[#2a3548] rounded-md p-3 z-[900]">
        <h4 className="text-xs font-medium mb-2">ACTIVE INCIDENTS</h4>
        <div className="grid grid-cols-1 gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#e63946] mr-2"></span>
              <span className="text-xs">Conflict</span>
            </div>
            <span className="text-xs font-mono">
              {counters.conflict} <span className={`text-[#e63946]`}>↑ 8%</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#f7a440] mr-2"></span>
              <span className="text-xs">Security</span>
            </div>
            <span className="text-xs font-mono">
              {counters.security} <span className={`text-[#f7a440]`}>↑ 5%</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#2ecc71] mr-2"></span>
              <span className="text-xs">Economy</span>
            </div>
            <span className="text-xs font-mono">
              {counters.economy} <span className={`text-[#2ecc71]`}>↑ 1%</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#3a7bd5] mr-2"></span>
              <span className="text-xs">Diplomacy</span>
            </div>
            <span className="text-xs font-mono">
              {counters.diplomacy} <span className={`text-[#3a7bd5]`}>↓ 3%</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#e74c3c] mr-2"></span>
              <span className="text-xs">Humanitarian</span>
            </div>
            <span className="text-xs font-mono">
              {counters.humanitarian} <span className={`text-[#e74c3c]`}>↑ 5%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

MapContainer.displayName = 'MapContainer';

export default MapContainer;

