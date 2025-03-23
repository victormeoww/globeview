"use client"

import { useState, useEffect } from "react"

const newsItems = [
  "Global markets disrupted by new export restrictions from major producer",
  "Military buildups reported along disputed territorial border in South America",
  "US deploys carrier group to Eastern Mediterranean as regional tensions escalate",
  "Cyber attack targets critical infrastructure in multiple European countries",
  "Rare earth mining operations expand in Africa amid growing technology demands",
  "Diplomatic channels reestablished between rival nations after decade of silence",
  "Unprecedented flooding displaces thousands in Southeast Asian coastal regions",
]

export default function NewsTicker() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % newsItems.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="news-ticker bg-[#1a1f29] border-b border-[#374151] py-1 px-4 overflow-hidden whitespace-nowrap">
      <div className="ticker-content flex items-center">
        {newsItems.map((item, index) => (
          <div
            key={index}
            className={`ticker-item inline-flex items-center ${index === activeIndex ? "opacity-100" : "opacity-0 absolute"} transition-opacity duration-500`}
          >
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

