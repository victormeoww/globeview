"use client"

import dynamic from 'next/dynamic'
import type { Event } from "@/lib/types"
import { forwardRef } from 'react'

// Dynamically import map components with no SSR
const MapComponents = dynamic(() => import("./map-components"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0a0e14]">
      <div className="text-[#8c95a6]">Loading map...</div>
    </div>
  ),
})

interface LeafletMapProps {
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
}

const LeafletMap = forwardRef<any, LeafletMapProps>(({
  events,
  onEventClick,
  mapStyle,
  focusedEventId,
  mapRef,
  fitBoundsOnLoad = true,
  fitBoundsOnUpdate = false
}, ref) => {
  return (
    <MapComponents
      events={events}
      onEventClick={onEventClick}
      selectedMapStyle={mapStyle}
      focusedEventId={focusedEventId}
      forwardedRef={mapRef}
    />
  )
})

LeafletMap.displayName = 'LeafletMap'

export default LeafletMap 