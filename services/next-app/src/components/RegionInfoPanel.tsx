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
  const [aiLoading, setAiLoading] = useState(false)

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

  if (regionsLoading) return <p>Loading region data…</p>
  if (isError) return <p className="text-red-500">Error loading region data.</p>
  if (!regionId) return <p>Click on a region to see details.</p>

  const info = regions[regionId]
  if (!info) {
    return <p className="text-gray-600"> No preset info for &quot;{regionId}&quot;. </p>
  }

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{info.name}</h2>
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={useAI}
            onChange={() => setUseAI((v) => !v)}
          />
          <span>Use AI</span>
        </label>
      </div>

      {aiLoading ? (
        <p>Generating AI description…</p>
      ) : (
        <p>{description}</p>
      )}

      {info.refs.length > 0 && (
        <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
          {info.refs.map((url) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
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
