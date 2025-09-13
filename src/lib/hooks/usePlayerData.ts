import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function usePlayerData(playerId: string) {
  const [playerData, setPlayerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayerData = useCallback(async () => {
    if (!playerId) return

    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single()

      if (fetchError) throw fetchError
      
      setPlayerData(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching player data:', err)
      setError('Failed to load player data')
      setLoading(false)
    }
  }, [playerId])

  const updatePlayerScore = useCallback((newScore: number) => {
    if (playerData) {
      setPlayerData({ ...playerData, score: newScore })
    }
  }, [playerData])

  return {
    playerData,
    loading,
    error,
    fetchPlayerData,
    updatePlayerScore
  }
}