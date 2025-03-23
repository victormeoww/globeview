"use client"

import { useState, useEffect } from "react"

export function Clock() {
  const [time, setTime] = useState("00:00:00Z")

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const hours = String(now.getUTCHours()).padStart(2, "0")
      const minutes = String(now.getUTCMinutes()).padStart(2, "0")
      const seconds = String(now.getUTCSeconds()).padStart(2, "0")
      setTime(`${hours}:${minutes}:${seconds}Z`)
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div id="digitalClock" className="ml-2 font-mono text-xs">
      {time}
    </div>
  )
}

