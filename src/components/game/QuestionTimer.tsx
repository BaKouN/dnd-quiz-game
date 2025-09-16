// src/components/game/QuestionTimer.tsx - Version corrigée
'use client'

import { useState, useEffect } from 'react'

interface QuestionTimerProps {
  isActive: boolean
  duration: number // en secondes
  onTimeUp: () => void
  onReset?: () => void
  startTime?: string
  displayOnly?: boolean
}

export function QuestionTimer({ 
  isActive, 
  duration, 
  onTimeUp, 
  onReset, 
  startTime, 
  displayOnly = false 
}: QuestionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)

  // Calculate time left based on database startTime (for synchronization)
  const calculateTimeLeft = () => {
    if (!startTime) return duration
    
    try {
      // IMPORTANT: Tout en UTC pour éviter les problèmes de timezone
      const startUTC = new Date(startTime).getTime() // Supabase retourne déjà en UTC
      const nowUTC = new Date().getTime() // getTime() retourne toujours UTC
      const elapsed = Math.floor((nowUTC - startUTC) / 1000)
      const remaining = Math.max(0, duration - elapsed)
      
      console.log('⏱️ Timer calc (UTC):', {
        startTime,
        startUTC: new Date(startUTC).toISOString(),
        nowUTC: new Date(nowUTC).toISOString(),
        elapsed,
        duration,
        remaining
      })
      
      return remaining
    } catch (error) {
      console.error('Timer parsing error:', error)
      return duration
    }
  }

  // NOUVEAU: Effet qui se déclenche quand startTime change (mise à jour du timer)
  useEffect(() => {
    if (startTime && isActive) {
      const remaining = calculateTimeLeft()
      console.log('🔄 Timer resync triggered:', { startTime, remaining, duration, isActive, currentTimeLeft: timeLeft })
      
      // Seulement mettre à jour si la différence est significative (>2 secondes)
      const timeDiff = Math.abs(remaining - timeLeft)
      if (timeDiff > 2 && remaining >= 0 && remaining <= duration) {
        console.log('⚡ Applying timer sync - significant change detected:', { timeDiff, newTime: remaining })
        setTimeLeft(remaining)
        
        if (remaining > 0) {
          setIsRunning(true)
        } else {
          setTimeLeft(0)
          setIsRunning(false)
          if (!displayOnly) {
            onTimeUp()
          }
        }
      }
    }
  }, [startTime, isActive, duration, displayOnly, onTimeUp, timeLeft])

  useEffect(() => {
    if (isActive && !startTime) {
      // Host mode - start fresh timer (pas de startTime de la DB)
      console.log('🎬 Starting fresh timer (host mode)')
      setTimeLeft(duration)
      setIsRunning(true)
    } else if (!isActive) {
      console.log('⏹️ Timer stopped')
      setIsRunning(false)
      setTimeLeft(duration)
    }
    // Si on a startTime, on laisse l'autre useEffect gérer
  }, [isActive, duration, startTime])

  useEffect(() => {
    if (onReset) {
      setTimeLeft(duration)
      setIsRunning(false)
    }
  }, [onReset, duration])

  // Sync timer with database périodiquement - AUGMENTÉ LA FRÉQUENCE
  useEffect(() => {
    if (!startTime || !isRunning) return

    const syncInterval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
      
      if (remaining <= 0) {
        setIsRunning(false)
        if (!displayOnly) {
          onTimeUp()
        }
      }
    }, 500) // Réduit de 1000ms à 500ms pour plus de réactivité

    return () => clearInterval(syncInterval)
  }, [startTime, isRunning, displayOnly, onTimeUp])

  // Main timer countdown
  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          if (!displayOnly) {
            onTimeUp()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, onTimeUp, displayOnly])

  const percentage = (timeLeft / duration) * 100
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