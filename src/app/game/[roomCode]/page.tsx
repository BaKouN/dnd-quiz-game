'use client'

import { useParams } from 'next/navigation'
import { useGameState } from '@/lib/hooks/useGameState'
import { useRealtimeGame } from '@/lib/hooks/useRealtimeGame'
import { GameStats } from '@/components/game/GameStats'
import { QuestionDisplay } from '@/components/game/QuestionDisplay'
import { Leaderboard } from '@/components/game/Leaderboard'
import { SimpleTimer } from '@/components/game/SimpleTimer'
import { SimpleTimerControls } from '@/components/game/SimpleTimerControls'
import { JoinInstructions } from '@/components/game/JoinInstructions'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { gameEngine } from '@/lib/game/gameEngine'

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

  const handleTimeUp = async () => {
    console.log('⏰ Host timer expired - revealing answers')
    try {
      await gameEngine.timeoutNonRespondents(roomCode)
    } catch (error) {
      console.error('Error timing out players:', error)
    }
  }

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
    <div className="min-h-screen bg-slate-900 text-white p-8 relative">
      {/* Contrôles Timer - Position fixe en haut à droite */}
      <SimpleTimerControls 
        roomCode={roomCode}
        gameStatus={gameState.game.status}
      />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-500">LEAD MILLIONAIRE</h1>
        <div className="text-xl mt-2">
          Room Code: <span className="font-mono bg-slate-800 px-3 py-1 rounded">{roomCode}</span>
        </div>
      </div>

      {/* Game Stats */}
      <div className="mb-8">
        <GameStats 
          totalPlayers={gameState.totalPlayers}
          currentQuestion={gameState.game.current_question}
          gameStatus={gameState.game.status}
        />
      </div>

      {/* Question Display */}
      {gameState.currentQuestion && (
        <div className="mb-8">
          <QuestionDisplay 
            question={gameState.currentQuestion}
            size="desktop"
          />
          
          {/* Timer Section */}
          {gameState.game.status === 'answering' && (
            <div className="mt-6 text-center">
              <SimpleTimer 
                isActive={gameState.game.status === 'answering'}
                onTimeUp={handleTimeUp}
              />
            </div>
          )}
          
          {/* Reveal Section */}
          {gameState.game.status === 'revealing' && (
            <div className="mt-6 p-6 bg-green-900/20 border border-green-500 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                Bonne réponse : {gameState.currentQuestion.answers[gameState.currentQuestion.correct]}
              </div>
              <div className="text-gray-300">
                {gameState.currentQuestion.explanation}
              </div>
            </div>
          )}
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
        
        {gameState.game.status === 'revealing' && (
          <Button onClick={nextQuestion} variant="primary" size="lg">
            Question Suivante
          </Button>
        )}
        
        {gameState.game.status === 'finished' && (
          <div className="text-2xl text-green-500 font-bold">
            🎉 Jeu Terminé ! 🎉
          </div>
        )}
      </div>

      {/* QR CODE */}
      <div className="mt-8">
        <JoinInstructions roomCode={roomCode} compact />
      </div>
    </div>
  )
}