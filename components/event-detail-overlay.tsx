"use client"

import { useState } from "react"
import dynamic from 'next/dynamic'
import type { Event } from "@/lib/types"
import { getCategoryColor, getCategoryBackground, getSourceBadge } from "@/lib/utils"

// Dynamically import Leaflet map for event detail
const MapDetail = dynamic(() => import("./map-detail"), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full flex items-center justify-center bg-[#1c2433]">
      <div className="text-xs text-[#8c95a6]">Loading map...</div>
    </div>
  ),
});

interface EventDetailOverlayProps {
  event: Event
  onClose: () => void
}

export default function EventDetailOverlay({ event, onClose }: EventDetailOverlayProps) {
  return (
    <div className="event-detail-overlay fixed inset-0 bg-black bg-opacity-70 z-[2000] flex items-center justify-center p-4">
      <div className="event-detail-content bg-[#141a24] border border-[#2a3548] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="event-detail-header flex justify-between items-start p-4 border-b border-[#2a3548]">
          <div>
            <span
              className="category-badge text-xs px-2 py-1 rounded inline-block mb-2"
              style={{
                backgroundColor: getCategoryBackground(event.category),
                color: getCategoryColor(event.category),
              }}
            >
              {event.category.toUpperCase()}
            </span>
            <h2 className="text-xl font-medium">{event.title}</h2>
            <div className="flex items-center mt-2 text-sm text-[#8c95a6]">
              <span className="mr-4">
                <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {event.date}
              </span>
              <span>
                <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {event.time}
              </span>
            </div>
          </div>
          <button 
            className="text-[#8c95a6] hover:text-white"
            onClick={onClose}
            title="Close details"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="event-detail-body p-4">
          <div className="source-info flex items-center mb-4 p-3 bg-[#1c2433] rounded-md">
            <span className="source-icon mr-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </span>
            <div>
              <div className="flex items-center">
                <span className="font-medium">{event.source}</span>
                {getSourceBadge(event.sourceType)}
              </div>
              <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3a7bd5]">
                {event.sourceUrl}
              </a>
            </div>
          </div>

          <div className="event-content text-[#c8cdd6] bg-[#1c2433] p-3 rounded-md mb-4">
            <p className="font-medium mb-4">{event.excerpt}</p>
            <p className="mb-4">{event.content}</p>
          </div>

          <div className="event-location mb-4">
            <h3 className="text-sm font-medium mb-2">LOCATION</h3>
            <div className="location-map bg-[#1c2433] rounded-md h-40">
              <MapDetail event={event} />
            </div>
            <div className="text-xs text-[#8c95a6] mt-1">
              Coordinates: {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
            </div>
          </div>

          <div className="related-events">
            <h3 className="text-sm font-medium mb-2">RELATED EVENTS</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="related-event bg-[#1c2433] p-2 rounded-md text-sm">
                <div className="flex justify-between">
                  <span className="text-xs text-[#3a7bd5]">2 DAYS AGO</span>
                  <span
                    className="category-badge text-xs px-1 rounded"
                    style={{
                      backgroundColor: getCategoryBackground(event.category),
                      color: getCategoryColor(event.category),
                    }}
                  >
                    {event.category.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1">Related event to {event.title}</p>
              </div>
              <div className="related-event bg-[#1c2433] p-2 rounded-md text-sm">
                <div className="flex justify-between">
                  <span className="text-xs text-[#3a7bd5]">5 DAYS AGO</span>
                  <span
                    className="category-badge text-xs px-1 rounded"
                    style={{
                      backgroundColor: getCategoryBackground(event.category),
                      color: getCategoryColor(event.category),
                    }}
                  >
                    {event.category.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1">Another related event to {event.title}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="event-detail-footer p-4 border-t border-[#2a3548] flex justify-between">
          <button className="bg-[#1c2433] hover:bg-[#232d3f] text-white px-4 py-2 rounded text-sm">
            <i className="fas fa-file-export mr-1"></i> EXPORT
          </button>
          <button className="bg-[#3a7bd5] hover:bg-[#2d62b3] text-white px-4 py-2 rounded text-sm">
            <i className="fas fa-share-alt mr-1"></i> SHARE
          </button>
        </div>
      </div>
    </div>
  )
}

