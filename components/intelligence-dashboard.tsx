"use client"

import { useState, useEffect, useRef } from "react"
import Header from "./header"
import GlobalTime from "./global-time"
import LeftSidebar from "./left-sidebar"
import MapContainer from "./map-container"
import RightSidebar from "./right-sidebar"
import MobileNav from "./mobile-nav"
import EventDetailOverlay from "./event-detail-overlay"
import type { Event, AnalysisReport } from "@/lib/types"
import { eventData, analysisReportData } from "@/lib/data"
import { generateIntelligenceUpdate, generateAnalysisReport } from "@/lib/openai"

export default function IntelligenceDashboard() {
  const [events, setEvents] = useState<Event[]>(eventData)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(eventData)
  const [reports, setReports] = useState<AnalysisReport[]>(analysisReportData)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventDetail, setShowEventDetail] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("latest")
  const [focusedEventId, setFocusedEventId] = useState<number | null>(null)
  const mapRef = useRef<any>(null)
  const [counters, setCounters] = useState({
    events: 47,
    sources: 47,
    regions: 36,
    conflict: 37,
    security: 38,
    economy: 24,
    diplomacy: 21,
    humanitarian: 24,
  })

  // Fetch intelligence updates from API
  useEffect(() => {
    const fetchIntelligenceUpdates = async () => {
      try {
        const response = await fetch('/api/live-updates?limit=50');
        if (!response.ok) {
          throw new Error('Failed to fetch intelligence updates');
        }
        const updates = await response.json();
        if (updates && updates.length > 0) {
          // Assign dynamic timestamps to the updates based on their position
          const now = Date.now();
          const timestampedUpdates = updates.map((update: Event, index: number) => {
            // Calculate timestamp based on position
            // First item (index 0) is newest (LIVE)
            // Last items are oldest
            const minutesAgo = index * 8; // Each item is 8 minutes older than the one above it
            const timestamp = now - (minutesAgo * 60 * 1000); // Convert minutes to milliseconds
            
            // Assign time based on how long ago it was
            let time;
            if (index === 0) {
              time = "LIVE"; // Top item is LIVE
            } else if (minutesAgo < 60) {
              time = `${minutesAgo}m ago`;
            } else {
              time = `${Math.floor(minutesAgo / 60)}h ago`;
            }
            
            return {
              ...update,
              timestamp,
              time,
              date: null, // Remove fixed dates
              createdAt: timestamp,
              updatedAt: timestamp
            };
          });
          
          setEvents(timestampedUpdates);
          setFilteredEvents(timestampedUpdates);
          
          // Update counters based on actual data
          const categories: Record<string, number> = {
            conflict: 0,
            security: 0,
            economy: 0,
            diplomacy: 0,
            humanitarian: 0,
          };
          
          updates.forEach((update: Event) => {
            const category = update.category.toLowerCase();
            if (categories[category] !== undefined) {
              categories[category]++;
            }
          });
          
          setCounters(prev => ({
            ...prev,
            events: updates.length,
            ...categories
          }));
        }
      } catch (error) {
        console.error('Error fetching intelligence updates:', error);
      }
    };

    // Fetch updates initially
    fetchIntelligenceUpdates();
    
    // Then fetch periodically with random interval between 5-17 seconds
    const getRandomInterval = () => Math.floor(5000 + Math.random() * 12000);
    let intervalId: NodeJS.Timeout;
    
    const scheduleNextFetch = () => {
      intervalId = setTimeout(() => {
        fetchIntelligenceUpdates();
        scheduleNextFetch();
      }, getRandomInterval());
    };
    
    scheduleNextFetch();
    
    return () => clearTimeout(intervalId);
  }, []);

  // Update event times from "LIVE" to "X time ago"
  useEffect(() => {
    const updateTimestamps = () => {
      setEvents(prevEvents => 
        prevEvents.map((event, index) => {
          if (!event.timestamp) {
            // If there's no timestamp (shouldn't happen with our updates), return as is
            return event;
          }
          
          const now = Date.now();
          const diff = now - event.timestamp;
          
          // Convert to seconds
          const seconds = Math.floor(diff / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          
          // For the most recent event (index 0)
          if (index === 0) {
            // Keep it as "LIVE" for the first 20 seconds
            if (seconds < 20) {
              return { ...event, time: "LIVE" };
            }
          }
          
          // Update time based on how long ago it occurred
          if (seconds < 60) {
            return { ...event, time: `${seconds}s ago` };
          } else if (minutes < 60) {
            return { ...event, time: `${minutes}m ago` };
          } else {
            return { ...event, time: `${hours}h ago` };
          }
        })
      );

      // Also update filtered events with the same timestamp logic
      setFilteredEvents(prevEvents => 
        prevEvents.map((event, index) => {
          if (!event.timestamp) {
            return event;
          }
          
          const now = Date.now();
          const diff = now - event.timestamp;
          
          // Convert to seconds
          const seconds = Math.floor(diff / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          
          // For the most recent event (index 0)
          if (index === 0) {
            // Keep it as "LIVE" for the first 20 seconds
            if (seconds < 20) {
              return { ...event, time: "LIVE" };
            }
          }
          
          // Update time based on how long ago it occurred
          if (seconds < 60) {
            return { ...event, time: `${seconds}s ago` };
          } else if (minutes < 60) {
            return { ...event, time: `${minutes}m ago` };
          } else {
            return { ...event, time: `${hours}h ago` };
          }
        })
      );
    };

    // Run the update every second to make it more responsive
    const interval = setInterval(updateTimestamps, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate new intelligence updates periodically
  useEffect(() => {
    const generateNewIntelligence = async () => {
      try {
        const newUpdate = await generateIntelligenceUpdate();
        if (newUpdate) {
          // Add to the beginning of the events array
          setEvents(prev => [newUpdate, ...prev]);
          setFilteredEvents(prev => [newUpdate, ...prev]);
          
          // Update counters
          setCounters(prev => ({
            ...prev,
            events: prev.events + 1,
            [newUpdate.category]: prev[newUpdate.category as keyof typeof prev] + 1 || 1,
          }));
        }
      } catch (error) {
        console.error("Error generating intelligence:", error);
      }
    };

    // Comment out intelligence update generation to stop API spam
    // const interval = setInterval(() => {
    //   generateNewIntelligence();
    // }, 15000 + Math.random() * 15000); // Between 15-30 seconds

    // // Generate one immediately
    // generateNewIntelligence();

    // return () => clearInterval(interval);
    return () => {}; // Empty cleanup function
  }, []);

  // Generate new analysis reports periodically
  useEffect(() => {
    const generateNewAnalysisReport = async () => {
      try {
        const newReport = await generateAnalysisReport();
        if (newReport) {
          // Add to the beginning of the reports array
          setReports(prev => [newReport, ...prev]);
        }
      } catch (error) {
        console.error("Error generating analysis report:", error);
      }
    };

    // Comment out automatic report generation to stop excessive API calls
    // const interval = setInterval(() => {
    //   generateNewAnalysisReport();
    // }, 40000 + Math.random() * 50000); // Between 40-90 seconds

    // // Generate one immediately
    // generateNewAnalysisReport();

    // return () => clearInterval(interval);
    return () => {}; // Empty cleanup function
  }, []);

  // Simulate real-time updates for counters
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update counters
      setCounters((prev) => ({
        ...prev,
        conflict: prev.conflict + (Math.random() > 0.5 ? 1 : 0),
        security: prev.security + (Math.random() > 0.5 ? 1 : 0),
        economy: prev.economy + (Math.random() > 0.7 ? 1 : 0),
        diplomacy: prev.diplomacy + (Math.random() > 0.8 ? 1 : 0),
        humanitarian: prev.humanitarian + (Math.random() > 0.7 ? 1 : 0),
      }))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setShowEventDetail(true)
    setFocusedEventId(event.id)
  }

  const handleLocateEvent = (event: Event) => {
    setFocusedEventId(event.id)
    // This will be used by the map component to focus on this event
  }

  const handleFilterChange = (category: string, value: string) => {
    // Filter events based on category and value
    let filtered = [...events]

    if (category === "category" && value !== "all") {
      filtered = filtered.filter((event) => event.category === value)
    }

    setFilteredEvents(filtered)
  }

  return (
    <div className="app-container bg-[#0a0e14] text-[#f0f2f5] flex flex-col min-h-screen h-screen">
      <Header counters={counters} />
      <GlobalTime />

      <div className="main-content flex-1 flex relative h-[calc(100%-6.75rem)] overflow-hidden">
        <LeftSidebar
          events={filteredEvents}
          isOpen={leftSidebarOpen}
          onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
          onEventClick={handleEventClick}
          onFilterChange={handleFilterChange}
          onLocateEvent={handleLocateEvent}
        />

        <MapContainer
          events={filteredEvents}
          onEventClick={handleEventClick}
          leftSidebarOpen={leftSidebarOpen}
          rightSidebarOpen={rightSidebarOpen}
          counters={counters}
          focusedEventId={focusedEventId}
          ref={mapRef}
        />

        <RightSidebar
          reports={reports}
          isOpen={rightSidebarOpen}
          onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <footer className="bg-[#141a24] p-2 text-xs text-[#8c95a6] hidden md:flex justify-between items-center">
        <div>© GlobeView by MacroAnalytica | The Musical Theater Company</div>
        <div className="flex gap-4">
          <span>About</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </footer>

      <MobileNav
        onLeftSidebarToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
        onRightSidebarToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
      />

      {showEventDetail && selectedEvent && (
        <EventDetailOverlay 
          event={selectedEvent} 
          onClose={() => {
            setShowEventDetail(false);
            setFocusedEventId(null);
          }} 
        />
      )}
    </div>
  )
}

