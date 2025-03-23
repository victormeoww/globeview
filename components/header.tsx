"use client"

import { Clock } from "./clock"
import { useState } from "react"

interface HeaderProps {
  counters: {
    events: number
    sources: number
    regions: number
  }
}

export default function Header({ counters }: HeaderProps) {
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  return (
    <header className="bg-[#141a24] border-b border-[#2a3548] p-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="logo-container mr-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3a7bd5] to-[#2ecc71] flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:from-[#2ecc71] hover:to-[#3a7bd5]">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              className="w-6 h-6 text-white" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <h1 className="text-xl font-bold">GlobeView</h1>
            <span className="text-xs bg-[#3a7bd5] text-white px-1.5 py-0.5 rounded ml-2">BETA</span>
          </div>
          <div className="text-xs text-[#8c95a6]">by MacroAnalytica</div>
        </div>
      </div>

      <div className="flex items-center">
        <div className="live-status flex items-center mr-4">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2ecc71] mr-2 animate-pulse"></span>
          <span className="text-xs font-medium">LIVE</span>
          <Clock />
        </div>

        <div className="counters hidden md:flex gap-4 mx-4">
          <div className="counter-item">
            <div className="text-xs text-[#8c95a6]">EVENTS:</div>
            <div className="font-mono font-medium">{counters.events}</div>
          </div>
          <div className="counter-item">
            <div className="text-xs text-[#8c95a6]">SOURCES:</div>
            <div className="font-mono font-medium">{counters.sources}</div>
          </div>
          <div className="counter-item">
            <div className="text-xs text-[#8c95a6]">REGIONS:</div>
            <div className="font-mono font-medium">{counters.regions}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex flex-col items-center">
            <button 
              onClick={() => setShowSubmitForm(true)} 
              className="btn-primary flex items-center gap-2 bg-[#e63946] border border-[#e63946] px-3 py-1.5 rounded text-xs hover:bg-[#d62c39] mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              SUBMIT INTELLIGENCE
            </button>
            <span className="text-[8px] text-[#8c95a6] mt-1">ACTIONABLE INTELLIGENCE ON THREATS TO NATIONAL SECURITY WILL BE REPORTED</span>
          </div>
          
          <button 
            className="btn-primary flex items-center gap-2 bg-[#1c2433] border border-[#2a3548] px-3 py-1.5 rounded text-xs hover:bg-[#232d3f]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            ENTERPRISE/GOVERNMENT
          </button>
          
          <button className="btn-primary flex items-center gap-2 bg-[#1c2433] border border-[#2a3548] px-3 py-1.5 rounded text-xs hover:bg-[#232d3f]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                clipRule="evenodd"
              />
            </svg>
            SIGN IN
          </button>
          <button className="btn-secondary flex items-center gap-2 bg-[#3a7bd5] px-3 py-1.5 rounded text-xs hover:bg-[#2d62b3]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            ABOUT
          </button>
        </div>
      </div>
      
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141a24] border border-[#2a3548] rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Submit Intelligence</h2>
              <button 
                className="text-[#8c95a6] hover:text-white" 
                onClick={() => setShowSubmitForm(false)}
                aria-label="Close form"
                title="Close form"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-[#e63946] text-xs mb-4">
              ACTIONABLE INTELLIGENCE ON THREATS TO NATIONAL SECURITY WILL BE REPORTED
            </p>
            <form className="space-y-4">
              <div>
                <label htmlFor="intelligence-type" className="block text-xs text-[#8c95a6] mb-1">Intelligence Type</label>
                <select 
                  id="intelligence-type"
                  className="w-full bg-[#1c2433] border border-[#2a3548] rounded px-3 py-2 text-sm"
                  aria-label="Select intelligence type"
                >
                  <option value="">Select Type</option>
                  <option value="conflict">Conflict Report</option>
                  <option value="security">Security Warning</option>
                  <option value="economy">Economic Intelligence</option>
                  <option value="diplomacy">Diplomatic Information</option>
                  <option value="humanitarian">Humanitarian Situation</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#8c95a6] mb-1">Location</label>
                <input type="text" className="w-full bg-[#1c2433] border border-[#2a3548] rounded px-3 py-2 text-sm" placeholder="City, Country" />
              </div>
              <div>
                <label className="block text-xs text-[#8c95a6] mb-1">Intelligence Details</label>
                <textarea className="w-full bg-[#1c2433] border border-[#2a3548] rounded px-3 py-2 text-sm h-24" placeholder="Provide detailed information..."></textarea>
              </div>
              <div>
                <label className="block text-xs text-[#8c95a6] mb-1">Source</label>
                <input type="text" className="w-full bg-[#1c2433] border border-[#2a3548] rounded px-3 py-2 text-sm" placeholder="Source of information" />
              </div>
              <div className="flex justify-end">
                <button 
                  type="button" 
                  className="bg-[#3a7bd5] px-4 py-2 rounded text-sm font-medium hover:bg-[#2d62b3]"
                  onClick={() => setShowSubmitForm(false)}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}

