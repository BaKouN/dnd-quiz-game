import { useState, useCallback, useEffect } from 'react'
import { gameEngine } from '@/lib/game/gameEngine'

export function useGameState(roomCode: string) {
  const [gameState, setGameState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGameState = useCallback(async () => {
    if (!roomCode) return

    try {
      setError(null)
      const state = await gameEngine.getGameState(roomCode)
      setGameState(state)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching game state:', err)
      setError('Failed to load game data')
      setLoading(false)
    }
  }, [roomCode])

  useEffect(() => {
    fetchGameState()
  }, [fetchGameState])

  const startGame = useCallback(async () => {
    try {
      await gameEngine.startGame(roomCode)
      // State will update via realtime
    } catch (err) {
      console.error('Error starting game:', err)
      setError('Failed to start game')
    }
  }, [roomCode])

  const nextQuestion = useCallback(async () => {
    try {
      await gameEngine.nextQuestion(roomCode)
      // State will update via realtime
    } catch (err) {
      console.error('Error going to next question:', err)
      setError('Failed to advance question')
    }
  }, [roomCode])

  const resetGame = useCallback(async () => {
    try {
      await gameEngine.resetGame(roomCode)
      // State will update via realtime
    } catch (err) {
      console.error('Error resetting game:', err)
      setError('Failed to reset game')
    }
  }, [roomCode])

  return {
    gameState,
    loading,
    error,
    fetchGameState,
    startGame,
    nextQuestion,
    resetGame
  }
}
