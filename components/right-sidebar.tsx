"use client"

import Link from "next/link"
import type { AnalysisReport } from "@/lib/types"
import { getCategoryColor, getCategoryBackground } from "@/lib/utils"

interface RightSidebarProps {
  reports: AnalysisReport[]
  isOpen: boolean
  onToggle: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function RightSidebar({ reports, isOpen, onToggle, activeTab, onTabChange }: RightSidebarProps) {
  return (
    <div
      className={`sidebar right-sidebar bg-[#141a24] border-l border-[#2a3548] transition-all duration-300 ${
        isOpen ? "w-[360px]" : "w-0"
      } overflow-hidden flex flex-col h-full`}
    >
      <div className="sidebar-header p-3 border-b border-[#2a3548] flex justify-between items-center">
        <h2 className="text-sm font-medium">ANALYSIS & REPORTS</h2>
        <button
          className="text-xs bg-[#1c2433] hover:bg-[#232d3f] px-2 py-1 rounded flex items-center gap-1"
          onClick={onToggle}
          title="Hide sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          HIDE
        </button>
      </div>

      <div className="tabs border-b border-[#2a3548]">
        <div className="flex">
          <button
            className={`flex-1 py-2 text-xs font-medium ${activeTab === "latest" ? "text-[#3a7bd5] border-b-2 border-[#3a7bd5]" : "text-[#8c95a6]"}`}
            onClick={() => onTabChange("latest")}
            title="Latest reports"
          >
            LATEST
          </button>
          <button
            className={`flex-1 py-2 text-xs font-medium ${activeTab === "trending" ? "text-[#3a7bd5] border-b-2 border-[#3a7bd5]" : "text-[#8c95a6]"}`}
            onClick={() => onTabChange("trending")}
            title="Trending reports"
          >
            TRENDING
          </button>
          <button
            className={`flex-1 py-2 text-xs font-medium ${activeTab === "featured" ? "text-[#3a7bd5] border-b-2 border-[#3a7bd5]" : "text-[#8c95a6]"}`}
            onClick={() => onTabChange("featured")}
            title="Featured reports"
          >
            FEATURED
          </button>
        </div>
      </div>

      <div className="reports-list flex-1 overflow-y-auto">
        {reports.map((report) => (
          <Link 
            key={report.id} 
            href={`/analysis/${report.slug}`}
            className="report-item p-3 border-b border-[#2a3548] hover:bg-[#1c2433] cursor-pointer block"
          >
            <div className="flex justify-between items-start">
              <span
                className="category-badge text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: getCategoryBackground(report.category),
                  color: getCategoryColor(report.category),
                }}
              >
                {report.category.toUpperCase()}
              </span>
              <span className="time-display text-xs text-[#8c95a6]">
                <svg className="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {report.date}
              </span>
            </div>

            <div className="flex mt-2">
              <div className="flex-shrink-0">
                <img
                  src={report.imageUrl || "/placeholder.svg?height=80&width=120"}
                  alt={report.title}
                  className="w-16 h-12 object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=80&width=120"
                  }}
                />
              </div>
              <div className="ml-2 flex-1">
                <h3 className="font-medium text-xs leading-tight">{report.title}</h3>
                <p className="text-xs text-[#c8cdd6] mt-1">By {report.author}</p>
              </div>
            </div>

            <div className="mt-2 flex justify-between items-center">
              <div className="engagement-stats flex gap-2">
                <div className="engagement-item flex items-center text-xs text-[#8c95a6]">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                  </svg>
                  <span>{report.likes}</span>
                </div>
                <div className="engagement-item flex items-center text-xs text-[#8c95a6]">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                  </svg>
                  <span>{report.comments}</span>
                </div>
              </div>
              <div className="text-xs text-[#c8cdd6]">{report.readTime} min</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="view-all-container p-3 border-t border-[#2a3548]">
        <Link 
          href="/analysis"
          className="w-full bg-[#1c2433] hover:bg-[#232d3f] text-[#3a7bd5] py-1.5 rounded text-xs flex items-center justify-center"
          title="View all analysis reports"
        >
          <svg className="w-3.5 h-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
          </svg>
          VIEW ALL ANALYSIS
        </Link>
      </div>

      <button
        className={`sidebar-toggle absolute top-1/2 ${isOpen ? "-left-6" : "-left-16"} transform -translate-y-1/2 bg-[#141a24] border border-[#2a3548] ${isOpen ? "rounded-l-md" : "rounded-md"} ${isOpen ? "p-1" : "p-1.5"} text-[#8c95a6] hover:text-white z-10 hover:bg-[#1c2433] transition-all duration-300`}
        onClick={onToggle}
        title={isOpen ? "Hide sidebar" : "Show analysis & reports"}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        ) : (
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-xs font-medium">EXPAND</span>
          </div>
        )}
      </button>
    </div>
  )
}

