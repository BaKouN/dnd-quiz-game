// app/join/[roomCode]/page.tsx
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { gameEngine } from '@/lib/game/gameEngine'

export default function JoinGame() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.roomCode as string
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  const joinGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsJoining(true)
    setError('')
    
    try {
      const playerId = await gameEngine.joinGame(roomCode, name.trim(), email.trim() || undefined)
      // Pour l'instant, on reste sur cette page et on montre le succès
      alert(`Joined successfully! Player ID: ${playerId}`)
    } catch (error) {
      console.error('Error joining game:', error)
      setError('Impossible de rejoindre la partie. Vérifiez le code.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">LEAD MILLIONAIRE</h1>
          <p className="text-gray-300 mt-2">Rejoignez la partie</p>
          <div className="text-xl font-mono bg-slate-800 p-3 rounded mt-4">
            Room: {roomCode}
          </div>
        </div>

        <form onSubmit={joinGame} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Votre nom *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-800 rounded border border-slate-600 text-white placeholder-gray-400"
              placeholder="Entrez votre nom"
              required
              disabled={isJoining}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email (optionnel)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-800 rounded border border-slate-600 text-white placeholder-gray-400"
              placeholder="votre@email.com"
              disabled={isJoining}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isJoining || !name.trim()}
            className="w-full py-3 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Connexion...' : 'Rejoindre la partie'}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Quiz éducatif sur le marketing digital</p>
          <p>5 questions • 5 minutes max</p>
        </div>
      </div>
    </div>
  )
}