// app/join/[roomCode]/page.tsx - Version simplifiée
'use client'

import { useParams, useRouter } from 'next/navigation'
import { gameEngine } from '@/lib/game/gameEngine'
import { JoinGameForm } from '@/components/game/JoinGameForm'
import { useState } from 'react'

export default function JoinGame() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.roomCode as string
  const [isJoining, setIsJoining] = useState(false)

  const handleJoin = async (name: string, email?: string) => {
    if (isJoining) {
      console.log('Already joining, ignoring double submit')
      return
    }
    
    setIsJoining(true)
    try {
      const playerId = await gameEngine.joinGame(roomCode, name, email)
      router.push(`/play/${roomCode}/${playerId}`)
    } catch (error) {
      console.error('Join error:', error)
      setIsJoining(false)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <JoinGameForm 
        roomCode={roomCode}
        onJoin={handleJoin}
      />
    </div>
  )
}