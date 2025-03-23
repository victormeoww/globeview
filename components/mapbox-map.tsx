"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { Event } from "@/lib/types"
import { forwardRef } from 'react'

// Dynamically import map components with no SSR
const MapboxGlobeComponent = dynamic(() => import("./mapbox-globe"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0a0e14]">
      <div className="text-[#8c95a6]">Loading 3D globe...</div>
    </div>
  ),
})

interface MapboxMapProps {
  events: Event[]
  onEventClick: (event: Event) => void
  mapStyle: {
    id: string
    name: string
    url: string
    attribution: string
  }
  focusedEventId: number | null
  mapRef: any
  fitBoundsOnLoad?: boolean
  fitBoundsOnUpdate?: boolean
  enableTerrain?: boolean
}

const MapboxMap = forwardRef<any, MapboxMapProps>(({
  events,
  onEventClick,
  mapStyle,
  focusedEventId,
  mapRef,
  fitBoundsOnLoad = true,
  fitBoundsOnUpdate = false,
  enableTerrain = false
}, ref) => {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Debug log to confirm component is rendering
    console.log("MapboxMap component rendering with style:", mapStyle.id);
    console.log("Terrain enabled:", enableTerrain);
    setIsLoading(false);
  }, [mapStyle.id, enableTerrain]);
  
  // Get Mapbox style URL directly from the mapStyle prop
  const mapboxStyleUrl = mapStyle.url;

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0a0e14]">
        <div className="text-[#8c95a6]">Preparing 3D globe...</div>
      </div>
    )
  }

  return (
    <MapboxGlobeComponent
      events={events}
      onEventClick={onEventClick}
      mapStyle={mapboxStyleUrl}
      focusedEventId={focusedEventId}
      forwardedRef={mapRef}
      enableTerrain={enableTerrain}
    />
  )
})

MapboxMap.displayName = 'MapboxMap'

export default MapboxMap 