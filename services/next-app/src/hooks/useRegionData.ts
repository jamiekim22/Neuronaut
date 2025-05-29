// services/next-app/hooks/useRegionData.ts

import useSWR from 'swr'

export interface RegionInfo {
  name: string
  desc: string
  refs: string[]
}

const fetcher = (url: string) => fetch(url).then(res => res.json() as Promise<Record<string, RegionInfo>>)

export function useRegionData() {
  // Tell SWR the data shape with generics <T, E>
  const { data, error } = useSWR<Record<string, RegionInfo>, Error>(
    '/data/regions.json',
    fetcher
  )

  return {
    regions: data ?? {},        // default to empty object until loaded
    isLoading: !data && !error,
    isError: !!error,
  }
}