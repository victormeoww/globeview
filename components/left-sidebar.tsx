"use client"

import { useState, useEffect } from "react"
import type { Event } from "@/lib/types"
import { getCategoryColor, getCategoryBackground, getSourceBadge, getSourceIcon } from "@/lib/utils"

interface LeftSidebarProps {
  events: Event[]
  isOpen: boolean
  onToggle: () => void
  onEventClick: (event: Event) => void
  onFilterChange: (category: string, value: string) => void
  onLocateEvent: (event: Event) => void
}

export default function LeftSidebar({
  events,
  isOpen,
  onToggle,
  onEventClick,
  onFilterChange,
  onLocateEvent,
}: LeftSidebarProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeSource, setActiveSource] = useState("all")
  const [activeRegion, setActiveRegion] = useState("all")
  const [activeTime, setActiveTime] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    onFilterChange("category", category)
  }

  return (
    <div
      className={`sidebar left-sidebar bg-[#141a24] border-r border-[#2a3548] transition-all duration-300 ${isOpen ? "w-[360px]" : "w-0"} overflow-hidden flex flex-col h-full`}
    >
      <div className="sidebar-header p-3 border-b border-[#2a3548] flex justify-between items-center">
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2ecc71] mr-2 animate-pulse"></span>
          <h3 className="text-sm font-medium">INTELLIGENCE FEED</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs flex items-center gap-1 bg-[#1c2433] hover:bg-[#232d3f] px-2 py-1 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            FILTERS
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3.5 w-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="text-xs text-[#8c95a6]">UPDATING...</div>
        </div>
      </div>

      {showFilters && (
        <div className="filter-container border-b border-[#2a3548] p-3 bg-[#1c2433]">
          <div className="mb-3">
            <h4 className="text-xs font-medium mb-2">CATEGORIES</h4>
            <div className="filter-chips flex flex-wrap gap-2">
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeCategory === "all" ? "bg-[#3a7bd5] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => handleCategoryChange("all")}
              >
                All Categories
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeCategory === "conflict" ? "bg-[#e63946] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => handleCategoryChange("conflict")}
              >
                Conflict
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeCategory === "security" ? "bg-[#f7a440] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => handleCategoryChange("security")}
              >
                Security
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeCategory === "economy" ? "bg-[#2ecc71] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => handleCategoryChange("economy")}
              >
                Economy
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeCategory === "diplomacy" ? "bg-[#3a7bd5] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => handleCategoryChange("diplomacy")}
              >
                Diplomacy
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-xs font-medium mb-2">SOURCES</h4>
            <div className="filter-chips flex flex-wrap gap-2">
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeSource === "all" ? "bg-[#3a7bd5] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => setActiveSource("all")}
              >
                All Sources
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeSource === "verified" ? "bg-[#2ecc71] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => setActiveSource("verified")}
              >
                Verified
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeSource === "osint" ? "bg-[#f7a440] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => setActiveSource("osint")}
              >
                OSINT
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeSource === "media" ? "bg-[#3a7bd5] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => setActiveSource("media")}
              >
                Media
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium mb-2">REGIONS</h4>
            <div className="filter-chips flex flex-wrap gap-2">
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeRegion === "all" ? "bg-[#3a7bd5] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => setActiveRegion("all")}
              >
                All Regions
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeRegion === "europe" ? "bg-[#3a7bd5] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => setActiveRegion("europe")}
              >
                Europe
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeRegion === "asia" ? "bg-[#3a7bd5] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => setActiveRegion("asia")}
              >
                Asia
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeRegion === "middleeast" ? "bg-[#3a7bd5] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => setActiveRegion("middleeast")}
              >
                Middle East
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeRegion === "africa" ? "bg-[#3a7bd5] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => setActiveRegion("africa")}
              >
                Africa
              </div>
              <div
                className={`filter-chip px-2 py-1 rounded-md text-xs cursor-pointer ${activeRegion === "americas" ? "bg-[#3a7bd5] text-white" : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"}`}
                onClick={() => setActiveRegion("americas")}
              >
                Americas
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="intelligence-feed flex-1 overflow-y-auto h-full">
        <div className="events-list">
          {events.map((event) => (
            <div
              key={event.id}
              className="event-item p-3 border-b border-[#2a3548] hover:bg-[#1c2433] cursor-pointer"
              onClick={() => onEventClick(event)}
            >
              <div className="flex justify-between items-start">
                <span
                  className="category-badge text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: getCategoryBackground(event.category.toLowerCase()),
                    color: getCategoryColor(event.category.toLowerCase()),
                  }}
                >
                  {event.category.toUpperCase()}
                </span>
                <span className="time-display text-xs text-[#8c95a6]">
                  <svg className="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {event.time === "LIVE" ? (
                    <span className="text-[#e63946] font-semibold">LIVE</span>
                  ) : (
                    event.time || event.date
                  )}
                </span>
              </div>

              <h4 className="font-medium mt-2 text-sm">{event.title}</h4>
              <p className="text-sm text-[#c8cdd6] mt-1.5 line-clamp-2">{event.excerpt}</p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center text-xs">
                  <span className="source-icon mr-1">
                    <i className={`fa-solid fa-${getSourceIcon(event.sourceType)} w-3.5 h-3.5 text-[#8c95a6]`}></i>
                  </span>
                  <span className="font-medium">{event.source}</span>
                  {getSourceBadge(event.sourceType)}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onLocateEvent(event)
                    }}
                    title="Locate on map"
                    className="text-xs bg-[#1c2433] hover:bg-[#232d3f] text-[#3a7bd5] px-2 py-1 rounded flex items-center"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                    </svg>
                    LOCATE
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                    title="View details"
                    className="text-xs bg-[#1c2433] hover:bg-[#232d3f] text-[#3a7bd5] px-2 py-1 rounded flex items-center"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    DETAILS
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="sidebar-toggle absolute top-1/2 -right-6 transform -translate-y-1/2 bg-[#141a24] border border-[#2a3548] rounded-r-md p-1 text-[#8c95a6] hover:text-white"
        onClick={onToggle}
        title="Toggle sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  )
}

