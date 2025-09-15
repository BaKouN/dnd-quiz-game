// components/game/QuestionTimer.tsx
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
    
    // Force UTC pour éviter les problèmes de timezone
    const start = new Date(startTime + 'Z').getTime()  // Force UTC si pas déjà
    const now = new Date().getTime()
    const elapsed = Math.floor((now - start) / 1000)
    const remaining = Math.max(0, duration - elapsed)
    
    return remaining
  }

  useEffect(() => {
    if (isActive && !isRunning) {
      if (startTime) {
        // Sync with database time
        const remaining = calculateTimeLeft()
        setTimeLeft(remaining)
        
        if (remaining > 0) {
          setIsRunning(true)
        } else {
          // Timer already expired
          setTimeLeft(0)
          if (!displayOnly) {
            onTimeUp()
          }
        }
      } else {
        // Host mode - start fresh timer
        setTimeLeft(duration)
        setIsRunning(true)
      }
    } else if (!isActive) {
      setIsRunning(false)
      setTimeLeft(duration)
    }
  }, [isActive, duration, isRunning, startTime, displayOnly, onTimeUp])

  useEffect(() => {
    if (onReset) {
      setTimeLeft(duration)
      setIsRunning(false)
    }
  }, [onReset, duration])

  // Sync timer with database periodically if startTime provided
  useEffect(() => {
    if (!startTime || !isRunning || displayOnly) return

    const syncInterval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
      
      if (remaining <= 0) {
        setIsRunning(false)
        onTimeUp()
      }
    }, 1000)

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
            className={`transition-all duration-1000 ${
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