// app/game/[roomCode]/page.tsx - Version avec hooks
'use client'

import { useParams } from 'next/navigation'
import { useGameState } from '@/lib/hooks/useGameState'
import { useRealtimeGame } from '@/lib/hooks/useRealtimeGame'
import { GameStats } from '@/components/game/GameStats'
import { QuestionDisplay } from '@/components/game/QuestionDisplay'
import { Leaderboard } from '@/components/game/Leaderboard'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function GameHost() {
  const params = useParams()
  const roomCode = params.roomCode as string
  
  const { 
    gameState, 
    loading, 
    error, 
    fetchGameState, 
    startGame, 
    nextQuestion 
  } = useGameState(roomCode)

  // Setup realtime subscriptions
  useRealtimeGame({
    roomCode,
    onGameUpdate: fetchGameState,
    onPlayerUpdate: fetchGameState
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <div className="text-2xl">Loading game...</div>
        </div>
      </div>
    )
  }

  if (error || !gameState) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-2xl text-red-500">{error || 'Game not found'}</div>
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

      {/* Game Stats */}
      <GameStats 
        totalPlayers={gameState.totalPlayers}
        currentQuestion={gameState.game.current_question}
        gameStatus={gameState.game.status}
      />

      {/* Question Display */}
      {gameState.currentQuestion && (
        <div className="mb-8">
          <QuestionDisplay 
            question={gameState.currentQuestion}
            size="desktop"
          />
        </div>
      )}

      {/* Leaderboard */}
      <div className="mb-8">
        <Leaderboard players={gameState.players} />
      </div>

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