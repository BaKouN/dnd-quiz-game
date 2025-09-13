'use client'

import { useState } from 'react'
import { gameEngine } from '@/lib/game/gameEngine'

export default function Home() {
  const [roomCode, setRoomCode] = useState('')
  const [gameState, setGameState] = useState<any>(null)
  const [playerId, setPlayerId] = useState('')

  const createGame = async () => {
    try {
      const result = await gameEngine.createGame()
      setRoomCode(result.roomCode)
      console.log('Game created:', result)
    } catch (error) {
      console.error('Error creating game:', error)
    }
  }

  const joinGame = async () => {
    try {
      const id = await gameEngine.joinGame(roomCode, 'TestPlayer', 'test@example.com')
      setPlayerId(id)
      console.log('Joined game, player ID:', id)
    } catch (error) {
      console.error('Error joining game:', error)
    }
  }

  const getState = async () => {
    try {
      const state = await gameEngine.getGameState(roomCode)
      setGameState(state)
      console.log('Game state:', state)
    } catch (error) {
      console.error('Error getting state:', error)
    }
  }

  const startGame = async () => {
    try {
      await gameEngine.startGame(roomCode)
      console.log('Game started!')
    } catch (error) {
      console.error('Error starting game:', error)
    }
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Game Engine Test</h1>
      
      <div className="space-y-2">
        <button onClick={createGame} className="px-4 py-2 bg-blue-500 text-white rounded">
          Create Game
        </button>
        
        <div>Room Code: <strong>{roomCode}</strong></div>
        
        <button onClick={joinGame} className="px-4 py-2 bg-green-500 text-white rounded">
          Join Game (TestPlayer)
        </button>
        
        <button onClick={getState} className="px-4 py-2 bg-purple-500 text-white rounded">
          Get Game State
        </button>
        
        <button onClick={startGame} className="px-4 py-2 bg-orange-500 text-white rounded">
          Start Game
        </button>
      </div>

      {gameState && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{JSON.stringify(gameState, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}