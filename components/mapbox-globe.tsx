"use client"

import { useEffect, useState, useRef } from "react"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Event } from "@/lib/types"
import { getCategoryColor } from "@/lib/utils"

// Set Mapbox access token directly
const MAPBOX_TOKEN = 'pk.eyJ1IjoidmljdG9yamkiLCJhIjoiY204a3ByczVrMGVuaDJycHJ3dW8zMTJubiJ9.YiH1_sr-iq8zQX4nzauOfg';
mapboxgl.accessToken = MAPBOX_TOKEN;

// Debug logs
console.log('=== MAPBOX COMPONENT LOADED ===');
console.log('Mapbox token:', MAPBOX_TOKEN);

// Helper function to calculate optimal center position based on event locations
const calculateOptimalCenter = (events: Event[]) => {
  if (!events.length) return { center: [0, 0] as [number, number], zoom: 1 };
  
  // Create a bounds object
  const bounds = new mapboxgl.LngLatBounds();
  
  // Extend the bounds with each event location
  events.forEach(event => {
    bounds.extend([event.location.lng, event.location.lat]);
  });
  
  // Calculate the center of the bounds
  const center = bounds.getCenter();
  
  // Calculate appropriate zoom level based on bounds size
  // This is a simplistic approach - you might want to refine it
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const maxDelta = Math.max(
    Math.abs(ne.lng - sw.lng),
    Math.abs(ne.lat - sw.lat)
  );
  
  // Logarithmic scale for zoom based on the size of the bounds
  // Smaller value = more zoomed out
  let zoom = 1;
  if (maxDelta < 5) zoom = 4; 
  else if (maxDelta < 25) zoom = 3;
  else if (maxDelta < 60) zoom = 2;
  else zoom = 1.5;
  
  // Find the region with the most events (create clusters)
  const gridSize = 10; // Grid size in degrees
  const grid: {[key: string]: number} = {};
  
  events.forEach(event => {
    const gridX = Math.floor(event.location.lng / gridSize);
    const gridY = Math.floor(event.location.lat / gridSize);
    const key = `${gridX}:${gridY}`;
    grid[key] = (grid[key] || 0) + 1;
  });
  
  // Find grid cell with most events
  let maxCount = 0;
  let densestGrid = '';
  
  Object.entries(grid).forEach(([key, count]) => {
    if (count > maxCount) {
      maxCount = count;
      densestGrid = key;
    }
  });
  
  // If we found a dense area, use its center as our focus
  if (densestGrid && maxCount > events.length / 3) { // If it has at least 1/3 of all events
    const [gridX, gridY] = densestGrid.split(':').map(Number);
    return { 
      center: [gridX * gridSize + gridSize/2, gridY * gridSize + gridSize/2] as [number, number],
      zoom: zoom + 0.5 // Zoom in a bit more for dense areas
    };
  }
  
  return { center: [center.lng, center.lat] as [number, number], zoom };
};

interface MapboxGlobeProps {
  events: Event[]
  onEventClick: (event: Event) => void
  mapStyle: string
  focusedEventId: number | null
  forwardedRef: any
  enableTerrain?: boolean
}

const MapboxGlobe = ({ events, onEventClick, mapStyle, focusedEventId, forwardedRef, enableTerrain = false }: MapboxGlobeProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null)
  const eventMarkers = useRef<{ [id: number]: mapboxgl.Marker }>({})
  const popups = useRef<{ [id: number]: mapboxgl.Popup }>({})
  const [mapInitError, setMapInitError] = useState<string | null>(null)
  const [mapInitialized, setMapInitialized] = useState(false)
  const initialViewSet = useRef(false)
  const userInteracted = useRef(false)
  const eventsRef = useRef(events)

  console.log('MapboxGlobe rendering with style:', mapStyle);
  console.log('Terrain enabled:', enableTerrain);

  // Update events ref when events change
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) {
      console.log('Map container ref is not available');
      return;
    }

    try {
      console.log('Initializing Mapbox with style:', mapStyle);
      
      // Initial center based on events if available
      const { center, zoom } = calculateOptimalCenter(events);
      
      // Create a new map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle || 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe', // Use globe projection for 3D
        zoom: zoom,
        center: center,
        pitch: 0, // Set pitch to 0 for a completely straight-on view
        bearing: 0, // Straight north orientation
        antialias: true, // Smoother rendering
        attributionControl: false, // We'll add this manually
        dragRotate: true, // Enable rotation
        touchZoomRotate: true, // Enable touch-based zoom and rotation
        doubleClickZoom: true, // Enable double-click zoom
        boxZoom: true, // Enable box zoom (shift + drag)
        scrollZoom: true, // Enable scroll wheel zoom
        dragPan: true, // Enable drag to pan
        keyboard: true, // Enable keyboard navigation
        touchPitch: true, // Enable touch-based pitch
        fadeDuration: 0, // Instant transitions for better performance
      })

      // Track user interaction
      const trackInteraction = () => {
        if (!userInteracted.current) {
          console.log('User has interacted with the map');
          userInteracted.current = true;
        }
      };
      
      map.current.on('mousedown', trackInteraction);
      map.current.on('touchstart', trackInteraction);
      map.current.on('wheel', trackInteraction);
      map.current.on('dragstart', trackInteraction);

      // Wait for map style to load
      map.current.on('style.load', () => {
        if (!map.current) return;
        
        try {
          // Add attribution control in bottom-left
          map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
          
          // Add navigation controls
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
          
          // Add 3D terrain if enabled
          if (enableTerrain) {
            map.current.addSource('mapbox-dem', {
              'type': 'raster-dem',
              'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
              'tileSize': 512,
              'maxzoom': 14
            });
            
            map.current.setTerrain({
              'source': 'mapbox-dem',
              'exaggeration': 1.5 // Adjust terrain exaggeration
            });
          }

          // Add atmosphere for better 3D effect
          map.current.setFog({
            color: 'rgb(10, 14, 33)', // Atmosphere color
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.4,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.8
          });

          // Add sky layer for more realistic 3D globe
          if (!map.current.getLayer('sky')) {
            map.current.addLayer({
              'id': 'sky',
              'type': 'sky',
              'paint': {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun': [0.0, 0.0],
                'sky-atmosphere-sun-intensity': 15
              }
            });
          }

          // Make water more visible on dark maps
          if (map.current.getLayer('water')) {
            map.current.setPaintProperty('water', 'fill-color', '#263755');
          }

          // Add touch controls for better mobile experience
          map.current.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: false
          }), 'top-right');

          // Add full-screen control
          map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
          
          setMapInitialized(true);
          console.log('Mapbox map fully initialized');

          // Ensure map gets a resize event after initialization
          setTimeout(() => {
            if (map.current) {
              map.current.resize();
              console.log('Sent resize event to map');
              initialViewSet.current = true;
            }
          }, 500);
        } catch (err) {
          console.error('Error setting map style:', err);
        }
      });

      // Forward ref methods for external control
      if (forwardedRef) {
        forwardedRef.current = {
          panTo: (lat: number, lng: number, zoom: number) => {
            if (map.current) {
              userInteracted.current = true; // Mark as user interaction to prevent auto-recenter
              map.current.flyTo({
                center: [lng, lat],
                zoom: zoom,
                essential: true
              });
            }
          }
        };
      }
      
      // Add event listeners to detect and log interaction issues
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });
      
    } catch (error) {
      console.error('Error initializing Mapbox:', error);
      setMapInitError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        console.log('Cleaning up Mapbox map');
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapStyle, forwardedRef, enableTerrain]);

  // Update markers when events change
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    try {
      // Clear existing markers
      Object.values(eventMarkers.current).forEach(marker => marker.remove());
      eventMarkers.current = {};
      
      // Clear existing popups
      Object.values(popups.current).forEach(popup => popup.remove());
      popups.current = {};

      // Add markers for each event
      events.forEach(event => {
        // Create custom marker element
        const color = getCategoryColor(event.category);
        const isLive = event.time === "LIVE";
        
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerHTML = `
          <div class="marker-container">
            <div class="marker-pulse" style="background-color: ${color}; animation: pulse 1.5s infinite; opacity: 0.4; border-radius: 50%; width: 30px; height: 30px; position: absolute; top: -15px; left: -15px; z-index: 1;"></div>
            <div class="marker-outer" style="background-color: rgba(10, 14, 20, 0.6); border: 2px solid ${color}; border-radius: 50%; width: 18px; height: 18px; position: absolute; top: -9px; left: -9px; z-index: 2;"></div>
            <div class="marker-inner" style="background-color: ${color}; border-radius: 50%; width: 10px; height: 10px; position: absolute; top: -5px; left: -5px; z-index: 3; box-shadow: 0 0 10px ${color};"></div>
            ${isLive ? `<div class="live-indicator" style="background-color: #e63946; border-radius: 50%; width: 6px; height: 6px; position: absolute; top: -16px; left: 4px; z-index: 4; animation: blink 1s infinite;"></div>` : ''}
          </div>
        `;
        
        // Create popup for hover
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 15,
          className: 'event-popup'
        }).setHTML(`
          <div class="bg-[#141a24] text-[#f0f2f5] p-2 rounded">
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full"
                style="background-color: ${color}"
              ></span>
              <span class="text-xs font-medium">${event.title}</span>
            </div>
            <div class="flex justify-between items-center mt-1">
              <div class="text-xs text-[#8c95a6]">${event.source}</div>
              <div class="text-xs text-[#8c95a6]">
                ${event.time === "LIVE" ? 
                  `<span class="text-[#e63946] font-semibold animate-pulse">LIVE</span>` : 
                  event.time}
              </div>
            </div>
          </div>
        `);
        
        // Create marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([event.location.lng, event.location.lat])
          .addTo(map.current!);
          
        // Event handlers
        el.addEventListener('mouseenter', () => {
          setHoveredEvent(event);
          popup.addTo(map.current!);
          marker.setPopup(popup);
          marker.togglePopup();
        });
        
        el.addEventListener('mouseleave', () => {
          setHoveredEvent(null);
          popup.remove();
        });
        
        el.addEventListener('click', () => {
          userInteracted.current = true; // Mark as user interaction
          onEventClick(event);
        });
        
        // Store references to markers and popups
        eventMarkers.current[event.id] = marker;
        popups.current[event.id] = popup;
      });
      
      // Only set initial view once and if no user interaction
      if (!userInteracted.current && initialViewSet.current && events.length > 0) {
        // Find optimal center after adding markers
        const { center, zoom } = calculateOptimalCenter(events);
        
        // Smoothly fly to the optimal center
        map.current.flyTo({
          center: center,
          zoom: zoom,
          pitch: 0,
          bearing: 0,
          duration: 2000,
          essential: true
        });
        
        // Don't need to do this again
        initialViewSet.current = false;
      }
    } catch (error) {
      console.error('Error updating markers:', error);
    }
  }, [events, onEventClick, mapInitialized]);

  // Handle focused event - ONLY trigger when focusedEventId changes to prevent unwanted recentering
  useEffect(() => {
    if (!map.current || !mapInitialized || focusedEventId === null) return;
    
    try {
      // Mark as user interaction to prevent auto-recenter
      userInteracted.current = true;
      
      const focusedEvent = events.find(event => event.id === focusedEventId);
      if (focusedEvent) {
        map.current.flyTo({
          center: [focusedEvent.location.lng, focusedEvent.location.lat],
          zoom: 4,
          pitch: 0, // Use flat pitch for consistent view
          bearing: 0,
          duration: 1500,
          essential: true
        });
      }
    } catch (error) {
      console.error('Error handling focused event:', error);
    }
  }, [focusedEventId, mapInitialized]); // Note we removed events dependency

  // Add CSS for markers and popups
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(0.8); opacity: 0.8; }
        70% { transform: scale(1.5); opacity: 0; }
        100% { transform: scale(0.8); opacity: 0; }
      }
      @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0.4; }
        100% { opacity: 1; }
      }
      .mapboxgl-popup.event-popup .mapboxgl-popup-content {
        background-color: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .mapboxgl-popup.event-popup .mapboxgl-popup-tip {
        display: none;
      }
      .mapboxgl-ctrl-top-right {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      /* Make navigation controls more visible */
      .mapboxgl-ctrl-group {
        background-color: rgba(20, 26, 36, 0.7) !important;
        border: 1px solid #2a3548 !important;
      }
      .mapboxgl-ctrl button {
        width: 32px !important;
        height: 32px !important;
      }
      .mapboxgl-ctrl button span {
        filter: brightness(1.5);
      }
      /* Fix for touch interaction */
      .mapboxgl-canvas-container.mapboxgl-touch-zoom-rotate.mapboxgl-touch-drag-pan {
        touch-action: none;
      }
      /* Center globe in container */
      .mapboxgl-canvas-container {
        width: 100% !important;
        height: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .mapboxgl-canvas {
        position: absolute !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
      }
      /* Main container styling */
      .map-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add window resize handler to ensure correct rendering
  useEffect(() => {
    if (!map.current || !mapInitialized) return;
    
    const handleResize = () => {
      if (map.current) {
        // Force map to resize and rerender
        map.current.resize();
        
        // Maintain pitch
        map.current.setPitch(0);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial call to ensure proper rendering
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mapInitialized]);

  // If there's an error, display it
  if (mapInitError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0e14]">
        <div className="text-white bg-red-800 p-4 rounded">
          <h3 className="font-bold mb-2">Failed to initialize 3D Globe</h3>
          <p>{mapInitError}</p>
          <p className="mt-2 text-sm">Using token: {MAPBOX_TOKEN.substring(0, 10)}...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={mapContainer} className="w-full h-full" />
      {!mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e14] bg-opacity-75 z-50">
          <div className="text-white p-4">
            <div className="animate-pulse">Initializing 3D Globe...</div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapboxGlobe; 