import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"
import type { ReactElement } from "react"

export function getCategoryColor(category: string): string {
  switch (category) {
    case "conflict":
      return "#e63946"
    case "security":
      return "#f7a440"
    case "economy":
      return "#2ecc71"
    case "diplomacy":
      return "#3a7bd5"
    case "politics":
      return "#9b59b6"
    case "environment":
      return "#3498db"
    case "humanitarian":
      return "#e74c3c"
    case "technology":
      return "#1abc9c"
    default:
      return "#f39c12"
  }
}

export function getCategoryBackground(category: string): string {
  switch (category) {
    case "conflict":
      return "rgba(230, 57, 70, 0.15)"
    case "security":
      return "rgba(247, 164, 64, 0.15)"
    case "economy":
      return "rgba(46, 204, 113, 0.15)"
    case "diplomacy":
      return "rgba(58, 123, 213, 0.15)"
    case "politics":
      return "rgba(155, 89, 182, 0.15)"
    case "environment":
      return "rgba(52, 152, 219, 0.15)"
    case "humanitarian":
      return "rgba(231, 76, 60, 0.15)"
    case "technology":
      return "rgba(26, 188, 156, 0.15)"
    default:
      return "rgba(243, 156, 18, 0.15)"
  }
}

export function getSourceIcon(sourceIcon: string): string {
  switch (sourceIcon) {
    case "telegram":
      return "paper-plane"
    case "twitter":
      return "twitter"
    case "government":
      return "landmark"
    case "news":
      return "newspaper"
    case "satellite":
      return "satellite"
    default:
      return "globe"
  }
}

export function getSourceBadge(sourceType: string): ReactElement {
  switch (sourceType) {
    case "verified":
      return React.createElement("span", {
        className: "ml-2 text-xs bg-[#2ecc71] bg-opacity-20 text-[#2ecc71] px-1 rounded"
      }, "VERIFIED");
    case "osint":
      return React.createElement("span", {
        className: "ml-2 text-xs bg-[#f7a440] bg-opacity-20 text-[#f7a440] px-1 rounded"
      }, "OSINT");
    case "analysis":
      return React.createElement("span", {
        className: "ml-2 text-xs bg-[#9b59b6] bg-opacity-20 text-[#9b59b6] px-1 rounded"
      }, "ANALYSIS");
    case "media":
      return React.createElement("span", {
        className: "ml-2 text-xs bg-[#3a7bd5] bg-opacity-20 text-[#3a7bd5] px-1 rounded"
      }, "MEDIA");
    default:
      return React.createElement(React.Fragment, null);
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

