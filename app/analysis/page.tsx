"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { analysisReportData } from "@/lib/data"
import { getCategoryColor, getCategoryBackground } from "@/lib/utils"
import type { AnalysisReport } from "@/lib/types"

export default function AnalysisPage() {
  const [reports, setReports] = useState<AnalysisReport[]>(analysisReportData)
  const [activeFilter, setActiveFilter] = useState("all")

  const filterReports = (category: string) => {
    setActiveFilter(category)
    if (category === "all") {
      setReports(analysisReportData)
    } else {
      setReports(analysisReportData.filter(report => report.category === category))
    }
  }

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "security", name: "Security" },
    { id: "economy", name: "Economy" },
    { id: "environment", name: "Environment" },
    { id: "politics", name: "Politics" },
    { id: "technology", name: "Technology" },
  ]

  return (
    <div className="bg-[#0a0e14] text-[#f0f2f5] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Analysis & Reports</h1>
            <p className="text-[#8c95a6] mt-2">In-depth analysis from our expert network</p>
          </div>
          <Link href="/" className="text-xs bg-[#1c2433] hover:bg-[#232d3f] px-3 py-2 rounded flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            BACK TO DASHBOARD
          </Link>
        </div>

        <div className="mb-6">
          <div className="filter-chips flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                className={`filter-chip px-3 py-1.5 rounded-md text-xs cursor-pointer ${
                  activeFilter === category.id 
                    ? category.id === "all" 
                      ? "bg-[#3a7bd5] text-white" 
                      : `bg-[${getCategoryColor(category.id)}] text-white` 
                    : "bg-[#1c2433] text-[#8c95a6] border border-[#2a3548]"
                }`}
                onClick={() => filterReports(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(report => (
            <Link 
              href={`/analysis/${report.slug}`} 
              key={report.id} 
              className="bg-[#141a24] border border-[#2a3548] rounded-lg overflow-hidden hover:border-[#3a7bd5] transition-colors"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={report.imageUrl} 
                  alt={report.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=240&width=360"
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span
                    className="category-badge text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: getCategoryBackground(report.category),
                      color: getCategoryColor(report.category),
                    }}
                  >
                    {report.category.toUpperCase()}
                  </span>
                  <span className="text-xs text-[#8c95a6]">{report.date}</span>
                </div>
                <h2 className="text-lg font-medium mb-2">{report.title}</h2>
                <p className="text-sm text-[#c8cdd6] mb-3 line-clamp-2">
                  {report.excerpt}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-[#8c95a6]">By {report.author}</div>
                  <div className="text-xs text-[#8c95a6]">{report.readTime} min read</div>
                </div>
              </div>
              <div className="p-4 border-t border-[#2a3548] flex justify-between items-center">
                <div className="engagement-stats flex gap-3">
                  <div className="engagement-item flex items-center text-xs text-[#8c95a6]">
                    <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                    </svg>
                    <span>{report.likes}</span>
                  </div>
                  <div className="engagement-item flex items-center text-xs text-[#8c95a6]">
                    <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                    </svg>
                    <span>{report.comments}</span>
                  </div>
                </div>
                <span className="text-xs text-[#3a7bd5]">READ MORE</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 