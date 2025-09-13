import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface UseRealtimeGameProps {
  roomCode: string
  playerId?: string
  onGameUpdate: () => void
  onPlayerUpdate?: () => void
  onResponseUpdate?: () => void
}

export function useRealtimeGame({ 
  roomCode, 
  playerId, 
  onGameUpdate, 
  onPlayerUpdate,
  onResponseUpdate 
}: UseRealtimeGameProps) {
  const subscribeToGame = useCallback(() => {
    if (!roomCode) return

    const channelName = playerId ? `player-${playerId}` : `game-${roomCode}`
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'games', 
          filter: `room_code=eq.${roomCode}` 
        },
        onGameUpdate
      )

    // Subscribe to player changes if playerId provided
    if (playerId && onPlayerUpdate) {
      channel.on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'players', 
          filter: `id=eq.${playerId}` 
        },
        onPlayerUpdate
      )
    } else if (onPlayerUpdate) {
      // Subscribe to all players for host view
      channel.on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'players' 
        },
        onPlayerUpdate
      )
    }

    // Subscribe to responses if needed
    if (onResponseUpdate) {
      channel.on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'responses' 
        },
        onResponseUpdate
      )
    }

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode, playerId, onGameUpdate, onPlayerUpdate, onResponseUpdate])

  useEffect(() => {
    const cleanup = subscribeToGame()
    return cleanup
  }, [subscribeToGame])

  return { subscribeToGame }
}