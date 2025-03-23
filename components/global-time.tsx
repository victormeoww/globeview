"use client"

import { useState, useEffect, useRef } from "react"

const cities = [
  { name: "NEW YORK", timezone: "America/New_York" },
  { name: "LONDON", timezone: "Europe/London" },
  { name: "MOSCOW", timezone: "Europe/Moscow" },
  { name: "BEIJING", timezone: "Asia/Shanghai" },
  { name: "TEL AVIV", timezone: "Asia/Jerusalem" },
]

const marketIndices = [
  { name: "DOW", value: 38245.32, change: +0.42, priority: 1 },
  { name: "S&P 500", value: 5021.84, change: +0.28, priority: 1 },
  { name: "NASDAQ", value: 15947.73, change: -0.15, priority: 1 },
  { name: "CRUDE OIL", value: 78.42, change: +1.24, priority: 2 },
  { name: "GOLD", value: 2342.8, change: +0.67, priority: 2 },
  { name: "BTC/USD", value: 62483.25, change: -2.14, priority: 3 },
]

export default function GlobalTime() {
  const [times, setTimes] = useState<Record<string, string>>({})
  const [localTime, setLocalTime] = useState("")
  const [localTimezone, setLocalTimezone] = useState("")
  const [indices, setIndices] = useState(marketIndices)
  const [visibleIndices, setVisibleIndices] = useState<typeof marketIndices>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Function to calculate available indices based on container width
  const calculateVisibleIndices = () => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const cityTimesWidth = cities.length * 80 // Approximate width for each city time
    const localTimeWidth = 150 // Approximate width for local time
    const availableWidth = containerWidth - cityTimesWidth - localTimeWidth
    
    // Calculate how many indices we can fit
    const averageIndexWidth = 120 // Approximate width for each market index
    const numIndicesFit = Math.floor(availableWidth / averageIndexWidth)
    
    // Sort indices by priority (lower number = higher priority)
    const sortedIndices = [...indices].sort((a, b) => a.priority - b.priority)
    
    // Take only the number of indices that fit
    setVisibleIndices(sortedIndices.slice(0, Math.max(1, numIndicesFit)))
  }

  useEffect(() => {
    // Calculate on mount and on window resize
    calculateVisibleIndices()
    const handleResize = () => calculateVisibleIndices()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [indices])

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date()

      // Update city times
      const newTimes: Record<string, string> = {}
      cities.forEach((city) => {
        try {
          const cityTime = new Date(now.toLocaleString("en-US", { timeZone: city.timezone }))
          const hours = String(cityTime.getHours()).padStart(2, "0")
          const minutes = String(cityTime.getMinutes()).padStart(2, "0")
          newTimes[city.name] = `${hours}:${minutes}`
        } catch (e) {
          newTimes[city.name] = "--:--"
        }
      })
      setTimes(newTimes)

      // Update local time
      const localHours = String(now.getHours()).padStart(2, "0")
      const localMinutes = String(now.getMinutes()).padStart(2, "0")
      setLocalTime(`${localHours}:${localMinutes}`)

      // Get timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const offset = -(now.getTimezoneOffset() / 60)
      const offsetStr = `(GMT${offset >= 0 ? "+" : ""}${offset})`
      setLocalTimezone(offsetStr)

      // Recalculate visible indices after update
      calculateVisibleIndices()
    }

    updateTimes()
    const interval = setInterval(updateTimes, 60000)

    // Simulate market changes
    const marketInterval = setInterval(() => {
      setIndices((prev) =>
        prev.map((index) => {
          const randomChange = (Math.random() * 0.4 - 0.2).toFixed(2)
          const newChange = Number.parseFloat((index.change + Number.parseFloat(randomChange)).toFixed(2))
          const changePercent = newChange / 100
          const valueChange = index.value * changePercent
          const newValue = Number.parseFloat((index.value + valueChange).toFixed(2))
          return { ...index, value: newValue, change: newChange }
        }),
      )
    }, 15000)

    return () => {
      clearInterval(interval)
      clearInterval(marketInterval)
    }
  }, [])

  return (
    <div className="global-time bg-[#141a24] border-b border-[#2a3548] py-2 px-4" ref={containerRef}>
      <div className="flex flex-wrap justify-between items-center">
        <div className="city-times flex flex-wrap gap-4 mb-2 md:mb-0">
          {cities.slice(0, Math.ceil(cities.length / 2)).map((city) => (
            <div key={city.name} className="city-time flex flex-col items-center">
              <div className="text-xs text-[#8c95a6]">{city.name}</div>
              <div className="font-mono text-sm">{times[city.name] || "--:--"}</div>
            </div>
          ))}
        </div>

        <div className="market-indicators flex-1 mx-4 flex justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-wrap gap-4 justify-center">
            {visibleIndices.map((index) => (
              <div key={index.name} className="market-index flex flex-col items-center">
                <div className="text-xs text-[#8c95a6]">{index.name}</div>
                <div className="flex items-center">
                  <span className="font-mono text-sm">{index.value.toLocaleString()}</span>
                  <span
                    className={`ml-1 text-xs font-medium ${
                      index.change > 0 ? "text-[#2ecc71]" : index.change < 0 ? "text-[#e63946]" : "text-[#8c95a6]"
                    }`}
                  >
                    {index.change > 0 ? "↑" : index.change < 0 ? "↓" : "–"} {Math.abs(index.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="city-times flex flex-wrap gap-4 mb-2 md:mb-0">
          {cities.slice(Math.ceil(cities.length / 2)).map((city) => (
            <div key={city.name} className="city-time flex flex-col items-center">
              <div className="text-xs text-[#8c95a6]">{city.name}</div>
              <div className="font-mono text-sm">{times[city.name] || "--:--"}</div>
            </div>
          ))}
        </div>

        <div className="local-time flex flex-col items-center">
          <div className="text-xs text-[#8c95a6]">YOUR TIME</div>
          <div className="font-mono text-sm">
            {localTime} <span className="text-[#3a7bd5]">{localTimezone}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

