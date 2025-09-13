// app/game/[roomCode]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { gameEngine } from '@/lib/game/gameEngine'
import { supabase } from '@/lib/supabase'

import { Button } from '@/components/ui/Button'
import { GameStats } from '@/components/game/GameStats'
import { QuestionDisplay } from '@/components/game/QuestionDisplay'
import { Leaderboard } from '@/components/game/Leaderboard'

export default function GameHost() {
  const params = useParams()
  const roomCode = params.roomCode as string
  
  const [gameState, setGameState] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchGameState = useCallback(async () => {
    try {
      const state = await gameEngine.getGameState(roomCode)
      setGameState(state)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching game state:', error)
      setLoading(false)
    }
  }, [roomCode])

  useEffect(() => {
    fetchGameState()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel(`game-${roomCode}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games', filter: `room_code=eq.${roomCode}` },
        fetchGameState
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        fetchGameState
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode, fetchGameState])

  const startGame = async () => {
    try {
      await gameEngine.startGame(roomCode)
    } catch (error) {
      console.error('Error starting game:', error)
    }
  }

  const nextQuestion = async () => {
    try {
      await gameEngine.nextQuestion(roomCode)
    } catch (error) {
      console.error('Error going to next question:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-2xl">Loading game...</div>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-2xl text-red-500">Game not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-500">LEAD MILLIONAIRE</h1>
        <div className="text-xl mt-2">
          Room Code: <span className="font-mono bg-slate-800 px-3 py-1 rounded">{roomCode}</span>
        </div>
      </div>

      {/* Game Status */}
      <GameStats 
        totalPlayers={gameState.totalPlayers}
        currentQuestion={gameState.game.current_question}
        gameStatus={gameState.game.status}
      />

      {/* Question Display */}
      {gameState.currentQuestion && (
        <QuestionDisplay 
          question={gameState.currentQuestion}
          size="desktop"
        />
      )}

      {/* Players List */}
      <Leaderboard players={gameState.players} />

      {/* Controls */}
      <div className="text-center space-x-4">
        {gameState.game.status === 'waiting' && (
          <Button onClick={startGame} variant="success" size="lg">
            Start Game
          </Button>
        )}
        
        {gameState.game.status === 'playing' && (
          <Button onClick={nextQuestion} variant="primary" size="lg">
            Next Question
          </Button>
        )}
        
        {gameState.game.status === 'finished' && (
          <div className="text-2xl text-green-500 font-bold">
            🎉 Game Finished! 🎉
          </div>
        )}
      </div>

      {/* QR Code Info */}
      <div className="text-center mt-8 text-gray-400">
        <p>Players join at: <span className="font-mono">localhost:3000/join/{roomCode}</span></p>
      </div>
    </div>
  )
}