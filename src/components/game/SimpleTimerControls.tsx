// src/components/game/SimpleTimerControls.tsx - Version simplifiée
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { gameEngine } from '@/lib/game/gameEngine'

interface SimpleTimerControlsProps {
  roomCode: string
  gameStatus: string
  isVisible?: boolean
}

export function SimpleTimerControls({ roomCode, gameStatus, isVisible = true }: SimpleTimerControlsProps) {
  const [answerStats, setAnswerStats] = useState({
    totalPlayers: 0,
    playersAnswered: 0,
    allAnswered: false
  })

  useEffect(() => {
    if (gameStatus !== 'answering') return

    const fetchStats = async () => {
      try {
        const stats = await gameEngine.getAnswerStats(roomCode)
        setAnswerStats(prevStats => {
          // Auto-réduire si tout le monde vient de voter
          if (!prevStats.allAnswered && stats.allAnswered && stats.totalPlayers > 0) {
            console.log('🎯 Tous les joueurs ont voté - réduction auto du timer')
            // Appeler la fonction globale pour réduire le timer
            if (typeof window !== 'undefined' && (window as any).forceTimerTo5Seconds) {
              (window as any).forceTimerTo5Seconds()
            }
          }
          return stats
        })
      } catch (error) {
        console.error('Error fetching answer stats:', error)
      }
    }

    // Fetch immédiatement puis toutes les 2 secondes
    fetchStats()
    const interval = setInterval(fetchStats, 2000)
    
    return () => clearInterval(interval)
  }, [roomCode, gameStatus])

  const handleForceTimer = () => {
    console.log('🎯 Manual timer force to 5 seconds')
    if (typeof window !== 'undefined' && (window as any).forceTimerTo5Seconds) {
      (window as any).forceTimerTo5Seconds()
    }
  }

  if (gameStatus !== 'answering' || !isVisible) {
    return null
  }

  const { totalPlayers, playersAnswered, allAnswered } = answerStats

  return (
    <div className="fixed top-4 right-4 bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-slate-600 text-sm">
      <div className="flex items-center space-x-3">
        <div className="text-gray-300">
          <span className={`font-bold ${allAnswered ? 'text-green-400' : 'text-orange-400'}`}>
            {playersAnswered}
          </span>
          <span className="text-gray-400">/{totalPlayers}</span>
        </div>
        
        <Button
          onClick={handleForceTimer}
          size="sm"
          variant={allAnswered ? "success" : "secondary"}
          className="text-xs px-2 py-1"
        >
          {allAnswered ? '✓ Auto' : '⚡ 5s'}
        </Button>
      </div>
      
      {allAnswered && (
        <div className="text-xs text-green-400 mt-1">
          ⚡ Timer réduit automatiquement !
        </div>
      )}
    </div>
  )
}