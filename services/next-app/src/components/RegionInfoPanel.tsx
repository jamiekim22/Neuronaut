"use client"

import { useState, useEffect } from "react"
import { useRegionData, RegionInfo } from "../hooks/useRegionData"

export default function RegionInfoPanel({
  regionId
}: {
  regionId: string | null
}) {
  const { regions, isLoading: regionsLoading, isError } = useRegionData()
  const [useAI, setUseAI] = useState(false)
  const [description, setDescription] = useState<string>("")
  const [displayedText, setDisplayedText] = useState<string>("")
  const [aiLoading, setAiLoading] = useState(false)
  const [, setIsTyping] = useState(false)

  // Typewriter effect
  useEffect(() => {
    if (!description) {
      setDisplayedText("")
      return
    }

    setIsTyping(true)
    setDisplayedText("")
    
    let index = 0
    const typewriterInterval = setInterval(() => {
      if (index < description.length) {
        setDisplayedText(description.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(typewriterInterval)
      }
    }, 3) // speed adjustment

    return () => clearInterval(typewriterInterval)
  }, [description])

  // When regionId or toggle changes, update description
  useEffect(() => {
    if (!regionId) {
      setDescription("")
      return
    }

    const info: RegionInfo | undefined = regions[regionId]
    if (!useAI) {
      // Static mode
      setDescription(info?.desc ?? "No description available.")
      return
    }

    // AI mode
    setAiLoading(true)
    fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: `Provide a concise overview of the ${info?.name || regionId} brain region and its main functions.`
      })
    })
      .then((res) => res.json())
      .then((json) => {
        setDescription(json.answer)
      })
      .catch(() => {
        setDescription("Failed to fetch AI description.")
      })
      .finally(() => {
        setAiLoading(false)
      })
  }, [regionId, useAI, regions])

  if (regionsLoading) return <p className="p-4 bg-black/70 backdrop-blur-sm rounded-lg text-white">Loading region data…</p>
  if (isError) return <p className="p-4 bg-black/70 backdrop-blur-sm rounded-lg text-red-400">Error loading region data.</p>
  if (!regionId) return <p className="p-4 bg-black/70 backdrop-blur-sm rounded-lg text-gray-300">Click on a region to see details.</p>

  const info = regions[regionId]
  if (!info) {
    return <p className="p-4 bg-black/70 backdrop-blur-sm rounded-lg text-gray-400"> No preset info for &quot;{regionId}&quot;. </p>
  }
  
  return (
    <div className="min-w-120 p-6 bg-black/70 backdrop-blur-sm rounded-lg shadow-lg space-y-6 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{info.name}</h2>
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={useAI}
            onChange={() => setUseAI((v) => !v)}
            className="accent-blue-500"
          />
          <span>Use AI</span>
        </label>
      </div>

      {aiLoading ? (
        <p className="text-lg text-gray-300">Generating AI description…</p>
      ) : (
        <p className="text-lg text-gray-200">
          {displayedText}
          <span
            className="w-1 h-5 ml-1 bg-gray-300 animate-pulse"
            style={{ animationDuration: '1.5s' }}
          >
            |
          </span>
        </p>
      )}

      {info.refs.length > 0 && (
        <ul className="mt-2 list-disc list-inside text-base text-gray-400">
          {info.refs.map((url) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-300 hover:text-blue-200"
              >
                Source
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}