"use client"

import { useEffect, useState, forwardRef, useImperativeHandle, MutableRefObject } from "react"
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Event } from "@/lib/types"
import { getCategoryColor } from "@/lib/utils"

// Fix for Leaflet marker icons in Next.js
const fixLeafletIcons = () => {
  // Only run on client side
  if (typeof window !== "undefined") {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
  }
}

// Custom marker icon creator
const createCustomIcon = (category: string, isLive: boolean = false) => {
  const color = getCategoryColor(category.toLowerCase());
  
  return L.divIcon({
    className: "custom-marker-icon",
    html: `
      <div class="marker-container">
        <div class="marker-pulse" style="background-color: ${color}; opacity: 0.4; border-radius: 50%; width: 26px; height: 26px; position: absolute; top: -13px; left: -13px; z-index: 1;"></div>
        <div class="marker-outer" style="background-color: rgba(10, 14, 20, 0.6); border: 2px solid ${color}; border-radius: 50%; width: 18px; height: 18px; position: absolute; top: -9px; left: -9px; z-index: 2;"></div>
        <div class="marker-inner" style="background-color: ${color}; border-radius: 50%; width: 10px; height: 10px; position: absolute; top: -5px; left: -5px; z-index: 3; box-shadow: 0 0 10px ${color};"></div>
        ${isLive ? `<div class="live-indicator" style="background-color: #e63946; border-radius: 50%; width: 6px; height: 6px; position: absolute; top: -16px; left: 4px; z-index: 4;"></div>` : ''}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

// Component to handle map center changes and focus on specific events
function MapCenterController({ events, focusedEventId }: { events: Event[], focusedEventId: number | null }) {
  const map = useMap()

  useEffect(() => {
    // If a specific event is focused, center the map on that event
    if (focusedEventId !== null) {
      const focusedEvent = events.find(event => event.id === focusedEventId);
      if (focusedEvent) {
        map.setView([focusedEvent.location.lat, focusedEvent.location.lng], 7);
      }
      return;
    }
    
    // Otherwise fit all events
    if (events.length > 0) {
      // Create bounds from all event locations
      const bounds = L.latLngBounds(events.map((event) => [event.location.lat, event.location.lng]))

      // Fit map to these bounds with some padding
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [events, map, focusedEventId])

  return null
}

interface MapComponentsProps {
  events: Event[]
  onEventClick: (event: Event) => void
  selectedMapStyle: {
    id: string
    name: string
    url: string
    attribution: string
  }
  focusedEventId: number | null
  forwardedRef: any
}

const MapComponents = ({ events, onEventClick, selectedMapStyle, focusedEventId, forwardedRef }: MapComponentsProps) => {
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null)
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)

  useEffect(() => {
    // Fix Leaflet icons on component mount
    fixLeafletIcons()
    
    // Apply any custom CSS to remove dark tint
    const customCSS = `
      .leaflet-tile {
        filter: brightness(1.05) contrast(1.05) !important;
      }
      .leaflet-container {
        background: transparent !important;
      }
      .event-popup .leaflet-popup-content-wrapper {
        background-color: #141a24;
        border: 1px solid #2a3548;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
      .event-popup .leaflet-popup-tip {
        background-color: #141a24;
        border: 1px solid #2a3548;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
    `;
    
    // Insert custom CSS
    const style = document.createElement('style');
    style.innerHTML = customCSS;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [])

  // Forward ref methods
  useEffect(() => {
    if (mapInstance && forwardedRef) {
      forwardedRef.current = {
        panTo: (lat: number, lng: number, zoom: number) => {
          mapInstance.setView([lat, lng], zoom);
        }
      };
    }
  }, [mapInstance, forwardedRef]);

  // Default map center (world view)
  const defaultCenter: [number, number] = [20, 0]
  const defaultZoom = 2

  return (
    <LeafletMap
      center={defaultCenter}
      zoom={defaultZoom}
      zoomControl={false}
      className="h-full w-full"
      style={{ background: "transparent" }}
      ref={setMapInstance}
    >
      <TileLayer
        attribution={selectedMapStyle.attribution}
        url={selectedMapStyle.url}
      />
      <ZoomControl position="topright" />
      <MapCenterController events={events} focusedEventId={focusedEventId} />

      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.location.lat, event.location.lng]}
          icon={createCustomIcon(event.category.toLowerCase(), event.time === "LIVE")}
          eventHandlers={{
            click: () => onEventClick(event),
            mouseover: () => setHoveredEvent(event),
            mouseout: () => setHoveredEvent(null),
          }}
        >
          {hoveredEvent === event && (
            <Popup className="event-popup" closeButton={false}>
              <div className="bg-[#141a24] text-[#f0f2f5] p-2 rounded">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getCategoryColor(event.category.toLowerCase()) }}
                  ></span>
                  <span className="text-xs font-medium">{event.title}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-[#8c95a6]">{event.source}</div>
                  <div className="text-xs text-[#8c95a6]">
                    {event.time === "LIVE" ? (
                      <span className="text-[#e63946] font-semibold animate-pulse">LIVE</span>
                    ) : (
                      event.time
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </LeafletMap>
  )
}

export default MapComponents; 