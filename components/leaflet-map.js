"use client"

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCategoryColor } from "@/lib/utils";

// Fix for Leaflet marker icons in Next.js
const fixLeafletIcons = () => {
  // Only run on client side
  if (typeof window !== "undefined") {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }
};

// Custom marker icon creator
const createCustomIcon = (category, isActive = false) => {
  const color = getCategoryColor(category);
  
  // Icons for different categories
  const iconMap = {
    conflict: "fas fa-fighter-jet",
    security: "fas fa-shield-alt",
    economy: "fas fa-chart-line",
    diplomacy: "fas fa-handshake",
    humanitarian: "fas fa-hands-helping",
    politics: "fas fa-landmark",
    technology: "fas fa-microchip"
  };
  
  const icon = iconMap[category] || "fas fa-globe";
  
  return L.divIcon({
    className: "custom-marker-icon",
    html: `
      <div class="marker-container ${isActive ? 'marker-active' : ''}">
        <div class="marker-pulse" style="background-color: ${color}"></div>
        <div class="marker-inner" style="background-color: ${color}">
          <i class="${icon}" style="color: white; font-size: 8px; display: flex; justify-content: center; align-items: center; height: 100%;"></i>
        </div>
      </div>
    `,
    iconSize: [isActive ? 30 : 24, isActive ? 30 : 24],
    iconAnchor: [isActive ? 15 : 12, isActive ? 15 : 12],
  });
};

// Component to handle map center changes and focus on specific events
function MapCenterController({ events, focusedEventId, fitBoundsOnLoad, fitBoundsOnUpdate }) {
  const map = useMap();

  useEffect(() => {
    // If a specific event is focused, center the map on that event
    if (focusedEventId !== null) {
      const focusedEvent = events.find(event => event.id === focusedEventId);
      if (focusedEvent) {
        map.flyTo([focusedEvent.location.lat, focusedEvent.location.lng], 7, {
          animate: true,
          duration: 0.8,
          noMoveStart: true // Prevents triggering movestart event
        });
      }
      return;
    }
    
    // Only fit all events on initial load, not on subsequent updates
    // to prevent unwanted zooming out
    if (events.length > 0 && fitBoundsOnLoad && !map._loaded) {
      // Create bounds from all event locations
      const bounds = L.latLngBounds(events.map((event) => [event.location.lat, event.location.lng]));

      // Fit map to these bounds with some padding
      map.fitBounds(bounds, { padding: [50, 50], noMoveStart: true });
    } else if (events.length > 0 && fitBoundsOnUpdate) {
      // Optionally fit bounds on updates too
      const bounds = L.latLngBounds(events.map((event) => [event.location.lat, event.location.lng]));
      map.fitBounds(bounds, { padding: [50, 50], noMoveStart: true });
    }
  }, [events, map, focusedEventId, fitBoundsOnLoad, fitBoundsOnUpdate]);

  return null;
}

// New component for event preview
function EventPreview({ event, onViewDetails, onClose }) {
  if (!event) return null;
  
  return (
    <div className="event-preview fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[1002] bg-[#141a24] border border-[#2a3548] rounded-md p-4 shadow-lg max-w-md w-full">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-[#8c95a6] hover:text-white"
        aria-label="Close preview"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex justify-between items-start mb-2">
        <span
          className="category-badge text-xs px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: `${getCategoryColor(event.category)}20`,
            color: getCategoryColor(event.category),
          }}
        >
          {event.category.toUpperCase()}
        </span>
        <span className="text-xs text-[#8c95a6]">{event.time || event.date}</span>
      </div>
      <h3 className="font-medium text-base mb-2">{event.title}</h3>
      <p className="text-sm text-[#c8cdd6] mb-3 line-clamp-2">{event.excerpt}</p>
      <div className="flex justify-between items-center">
        <div className="text-xs text-[#8c95a6]">
          Source: {event.source}
        </div>
        <button 
          onClick={() => onViewDetails(event)}
          className="text-xs bg-[#3a7bd5] hover:bg-[#2d62b3] px-3 py-1 rounded text-white"
        >
          VIEW DETAILS
        </button>
      </div>
    </div>
  );
}

function LeafletMap({ events, onEventClick, mapStyle, focusedEventId, mapRef, fitBoundsOnLoad = true, fitBoundsOnUpdate = false }) {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const popupRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  // Define conflict zones with brighter colors and higher opacity
  const conflictZones = [
    {
      name: "Post Oct-7th Gaza War",
      coordinates: [
        [31.5, 34.2], // Gaza
        [33.8, 35.5], // Lebanon
        [32.0, 35.0], // West Bank
        [31.0, 35.0], // Israel
        [34.8, 38.9], // Syria
        [15.3, 44.2]  // Yemen
      ],
      color: "#ff4d4d",
      fillColor: "#ff4d4d",
      opacity: 1,
      fillOpacity: 0.25,
      weight: 3,
      dashArray: "5, 5"
    },
    {
      name: "Ukraine War",
      coordinates: [
        [49.0, 31.5], // Ukraine center
        [55.0, 37.6]  // Russia (Moscow)
      ],
      color: "#ffaa00",
      fillColor: "#ffaa00",
      opacity: 1,
      fillOpacity: 0.25,
      weight: 3,
      dashArray: "5, 5"
    },
    {
      name: "Sudanese Civil War",
      coordinates: [
        [15.6, 32.5], // Khartoum
        [12.8, 30.2]  // Sudan south
      ],
      color: "#ff6b6b",
      fillColor: "#ff6b6b",
      opacity: 1,
      fillOpacity: 0.25,
      weight: 3,
      dashArray: "5, 5"
    }
  ];

  useEffect(() => {
    // Fix Leaflet icons on component mount
    fixLeafletIcons();
    
    // Apply custom CSS for markers and conflict zones
    const customCSS = `
      .leaflet-tile {
        filter: brightness(1.05) contrast(1.05) !important;
      }
      .leaflet-container {
        background: transparent !important;
      }
      .marker-pulse {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        opacity: 0.5;
      }
      .marker-inner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60%;
        height: 60%;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .marker-active {
        box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.6);
      }
      @keyframes pulse {
        0% {
          transform: scale(0.95);
          opacity: 0.6;
        }
        70% {
          transform: scale(1.2);
          opacity: 0;
        }
        100% {
          transform: scale(0.95);
          opacity: 0;
        }
      }
      .event-popup .leaflet-popup-content-wrapper {
        background: transparent;
        box-shadow: none;
        border: none;
      }
      .event-popup .leaflet-popup-tip-container {
        display: none;
      }
      .conflict-zone-label {
        background: rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 3px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: bold;
        white-space: nowrap;
        z-index: 400 !important;
      }
      /* Ensure conflict zones appear below markers */
      .leaflet-overlay-pane {
        z-index: 400;
      }
      .leaflet-marker-pane {
        z-index: 500;
      }
      /* Make conflict zone strokes more visible */
      .leaflet-interactive {
        stroke-opacity: 0.9 !important;
        stroke-width: 2px !important;
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
  }, []);

  // Add conflict zones to map - modify this useEffect to ensure zones are being created
  useEffect(() => {
    if (!mapInstance) return;
    
    console.log("Adding conflict zones to map...");
    
    // Create an array to store all conflict zone objects
    const conflictZoneObjects = [];
    
    // Create conflict zones
    conflictZones.forEach(zone => {
      console.log(`Creating zone: ${zone.name}`);
      // Create a circle or polygon for each conflict zone
      let conflictZoneObject;
      let label;
      
      if (zone.name === "Post Oct-7th Gaza War") {
        // For Gaza War, use a polygon to cover the whole region
        const points = [
          [31.5, 34.2],  // Gaza
          [33.8, 35.5],  // Lebanon
          [35.0, 38.0],  // Syria North
          [33.0, 40.0],  // Syria East
          [29.0, 35.0],  // Jordan
          [15.0, 48.0],  // Yemen East
          [12.0, 44.0],  // Yemen West
          [27.0, 34.0]   // Egypt  
        ];
        
        conflictZoneObject = L.polygon(points, {
          color: zone.color,
          weight: zone.weight,
          fillOpacity: zone.fillOpacity,
          opacity: zone.opacity,
          fillColor: zone.fillColor,
          dashArray: zone.dashArray
        }).addTo(mapInstance);
        
        console.log("Added Gaza War polygon to map");
        
        // Add label in the center of the polygon
        const center = L.polygon(points).getBounds().getCenter();
        label = L.divIcon({
          className: 'conflict-zone-label',
          html: `<div style="background: rgba(0,0,0,0.8); color: white; padding: 5px 10px; border-radius: 4px; border: 2px solid ${zone.color}; font-weight: bold; font-size: 12px; white-space: nowrap;">${zone.name}</div>`,
          iconSize: [200, 36],
          iconAnchor: [100, 18]
        });
        
        L.marker(center, { icon: label }).addTo(mapInstance);
      } 
      else if (zone.name === "Ukraine War") {
        // For Ukraine War, use a circle centered on Ukraine
        conflictZoneObject = L.circle([49.0, 31.5], {
          radius: 800000, // 800km
          color: zone.color,
          weight: zone.weight,
          fillOpacity: zone.fillOpacity,
          opacity: zone.opacity,
          fillColor: zone.fillColor,
          dashArray: zone.dashArray
        }).addTo(mapInstance);
        
        console.log("Added Ukraine War circle to map");
        
        // Add label
        label = L.divIcon({
          className: 'conflict-zone-label',
          html: `<div style="background: rgba(0,0,0,0.8); color: white; padding: 5px 10px; border-radius: 4px; border: 2px solid ${zone.color}; font-weight: bold; font-size: 12px; white-space: nowrap;">${zone.name}</div>`,
          iconSize: [150, 36],
          iconAnchor: [75, 18]
        });
        
        L.marker([49.0, 31.5], { icon: label }).addTo(mapInstance);
      }
      else if (zone.name === "Sudanese Civil War") {
        // For Sudan, use a circle centered on Khartoum
        conflictZoneObject = L.circle([15.6, 32.5], {
          radius: 600000, // 600km
          color: zone.color,
          weight: zone.weight,
          fillOpacity: zone.fillOpacity,
          opacity: zone.opacity,
          fillColor: zone.fillColor,
          dashArray: zone.dashArray
        }).addTo(mapInstance);
        
        console.log("Added Sudan Civil War circle to map");
        
        // Add label
        label = L.divIcon({
          className: 'conflict-zone-label',
          html: `<div style="background: rgba(0,0,0,0.8); color: white; padding: 5px 10px; border-radius: 4px; border: 2px solid ${zone.color}; font-weight: bold; font-size: 12px; white-space: nowrap;">${zone.name}</div>`,
          iconSize: [180, 36],
          iconAnchor: [90, 18]
        });
        
        L.marker([15.6, 32.5], { icon: label }).addTo(mapInstance);
      }
      
      if (conflictZoneObject) {
        conflictZoneObjects.push(conflictZoneObject);
      }
    });
    
    // Cleanup function to remove conflict zones when component unmounts
    return () => {
      conflictZoneObjects.forEach(object => {
        if (mapInstance) {
          mapInstance.removeLayer(object);
        }
      });
    };
  }, [mapInstance]);

  // Forward ref methods
  useEffect(() => {
    if (mapInstance && mapRef) {
      mapRef.current = {
        panTo: (lat, lng, zoom) => {
          mapInstance.setView([lat, lng], zoom);
        }
      };
    }
  }, [mapInstance, mapRef]);

  // Set focused event from props
  useEffect(() => {
    if (focusedEventId !== null) {
      const event = events.find(e => e.id === focusedEventId);
      if (event) {
        setSelectedEvent(event);
        setShowPreview(true);
      }
    } else {
      setSelectedEvent(null);
      setShowPreview(false);
    }
  }, [focusedEventId, events]);

  // Default map center (world view)
  const defaultCenter = [20, 0];
  const defaultZoom = 2;

  const handleMapCreated = (map) => {
    setMapInstance(map);
  };

  const handleMarkerHover = (event) => {
    setHoveredEvent(event);
    
    // Don't zoom on hover anymore
    // This was causing erratic zoom behavior
  };

  const handleMarkerClick = (event) => {
    setSelectedEvent(event);
    setShowPreview(true);
    
    // Zoom to the event location on click, but with more moderate settings
    // and without triggering any state resets
    if (mapInstance) {
      // Using flyTo instead of setView for smoother animation and to prevent map resets
      mapInstance.flyTo(
        [event.location.lat, event.location.lng], 
        6, 
        {
          animate: true,
          duration: 0.8,
          noMoveStart: true // Prevents the movestart event from firing
        }
      );
    }
  };

  const handleViewDetails = (event) => {
    onEventClick(event);
    setShowPreview(false);
  };
  
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: "transparent" }}
        whenCreated={handleMapCreated}
      >
        <TileLayer
          attribution={mapStyle.attribution}
          url={mapStyle.url}
        />
        <ZoomControl position="topright" />
        <MapCenterController 
          events={events} 
          focusedEventId={focusedEventId} 
          fitBoundsOnLoad={fitBoundsOnLoad}
          fitBoundsOnUpdate={fitBoundsOnUpdate}
        />

        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.location.lat, event.location.lng]}
            icon={createCustomIcon(
              event.category, 
              event.id === focusedEventId || event === selectedEvent || event === hoveredEvent
            )}
            eventHandlers={{
              click: () => handleMarkerClick(event),
              mouseover: () => handleMarkerHover(event),
              mouseout: () => setHoveredEvent(null),
            }}
          >
            {hoveredEvent === event && (
              <Popup className="event-popup" closeButton={false} ref={popupRef}>
                <div className="bg-[#141a24] text-[#f0f2f5] p-2 rounded border border-[#2a3548]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(event.category) }}
                    ></span>
                    <span className="text-xs font-medium">{event.title}</span>
                  </div>
                  <div className="text-xs text-[#8c95a6] mt-1">{event.source}</div>
                  <div className="mt-1">
                    <button 
                      className="text-[10px] bg-[#3a7bd5] hover:bg-[#2d62b3] px-2 py-0.5 rounded text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkerClick(event);
                      }}
                    >
                      MORE INFO
                    </button>
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
      
      {showPreview && selectedEvent && (
        <EventPreview 
          event={selectedEvent} 
          onViewDetails={handleViewDetails}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}

export default LeafletMap; 