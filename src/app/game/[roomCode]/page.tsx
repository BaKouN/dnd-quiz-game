// app/game/[roomCode]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { gameEngine } from '@/lib/game/gameEngine'
import { supabase } from '@/lib/supabase'

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
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 p-4 rounded text-center">
          <div className="text-2xl font-bold">{gameState.totalPlayers}</div>
          <div className="text-gray-400">Players</div>
        </div>
        <div className="bg-slate-800 p-4 rounded text-center">
          <div className="text-2xl font-bold">{gameState.game.current_question}/5</div>
          <div className="text-gray-400">Question</div>
        </div>
        <div className="bg-slate-800 p-4 rounded text-center">
          <div className="text-2xl font-bold capitalize">{gameState.game.status}</div>
          <div className="text-gray-400">Status</div>
        </div>
      </div>

      {/* Question Display */}
      {gameState.currentQuestion && (
        <div className="bg-slate-800 p-8 rounded-lg mb-8 text-center">
          <div className="text-3xl font-bold text-orange-500 mb-4">
            {gameState.currentQuestion.value.toLocaleString()} LEADS
          </div>
          <div className="text-2xl mb-6">
            {gameState.currentQuestion.question}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {gameState.currentQuestion.answers.map((answer: string, index: number) => (
              <div key={index} className="bg-slate-700 p-4 rounded text-lg">
                <span className="font-bold text-orange-500">{'ABCD'[index]}: </span>
                {answer}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players List */}
      <div className="bg-slate-800 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
        {gameState.players.length === 0 ? (
          <div className="text-gray-400 text-center">No players yet...</div>
        ) : (
          <div className="space-y-2">
            {gameState.players.map((player: any, index: number) => (
              <div key={player.id} className="flex justify-between items-center">
                <span>{index + 1}. {player.name}</span>
                <span className="font-bold">{player.score.toLocaleString()} leads</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center space-x-4">
        {gameState.game.status === 'waiting' && (
          <button
            onClick={startGame}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
          >
            Start Game
          </button>
        )}
        
        {gameState.game.status === 'playing' && (
          <button
            onClick={nextQuestion}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
          >
            Next Question
          </button>
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