// src/components/game/SimpleTimer.tsx - Nouveau composant simple
'use client'

import { useState, useEffect, useRef } from 'react'

interface SimpleTimerProps {
  isActive: boolean
  onTimeUp: () => void
  onTimerUpdate?: (timeLeft: number) => void
}

export function SimpleTimer({ isActive, onTimeUp, onTimerUpdate }: SimpleTimerProps) {
  const [timeLeft, setTimeLeft] = useState(45)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  // Fonction pour réduire le timer à 5 secondes
  const reduceToFiveSeconds = () => {
    console.log('⚡ Reducing timer to 5 seconds')
    setTimeLeft(5)
  }

  // Exposer la fonction pour le contrôle externe
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).forceTimerTo5Seconds = reduceToFiveSeconds
    }
  }, [])

  useEffect(() => {
    if (onTimerUpdate) {
      onTimerUpdate(timeLeft)
    }
  }, [timeLeft, onTimerUpdate])

  useEffect(() => {
    if (isActive && !isRunning) {
      console.log('🎬 Starting timer - 45 seconds')
      setTimeLeft(45)
      setIsRunning(true)
    } else if (!isActive) {
      console.log('⏹️ Stopping timer')
      setIsRunning(false)
      setTimeLeft(45)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isRunning])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          console.log('⏰ Timer expired!')
          setIsRunning(false)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, onTimeUp])

  const percentage = (timeLeft / 45) * 100
  const isUrgent = timeLeft <= 10

  const formatTime = (seconds: number) => {
    return seconds.toString().padStart(2, '0')
  }

  return (
    <div className="flex items-center justify-center space-x-4">
      {/* Circular Progress */}
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-600"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
            className={`transition-all duration-500 ${
              isUrgent ? 'text-red-500' : 'text-orange-500'
            }`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${
            isUrgent ? 'text-red-500' : 'text-white'
          }`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <div className={`text-sm font-medium ${
          isUrgent ? 'text-red-400' : 'text-gray-400'
        }`}>
          {timeLeft > 0 ? 'Temps restant' : 'Temps écoulé !'}
        </div>
        
        {isUrgent && timeLeft > 0 && (
          <div className="text-xs text-red-400 animate-pulse">
            Dépêchez-vous !
          </div>
        )}
      </div>
    </div>
  )
}