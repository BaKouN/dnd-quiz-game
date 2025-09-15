// app/play/[roomCode]/[playerId]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { gameEngine } from '@/lib/game/gameEngine'
import { questions } from '@/lib/game/questions'
import { PlayerStats } from '@/components/game/PlayerStats'
import { QuestionDisplay } from '@/components/game/QuestionDisplay'
import { AnswerButtons } from '@/components/game/AnswerButtons'
import { WaitingScreen } from '@/components/game/WaitingScreen'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function PlayerInterface() {
  const params = useParams()
  const roomCode = params.roomCode as string
  const playerId = params.playerId as string
  
  const [gameState, setGameState] = useState<any>(null)
  const [playerData, setPlayerData] = useState<any>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchGameData = useCallback(async () => {
    try {
      // Get game state
      const state = await gameEngine.getGameState(roomCode)
      setGameState(state)

      // Get player data
      const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single()

      if (error) throw error
      setPlayerData(player)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching game data:', error)
      setLoading(false)
    }
  }, [roomCode, playerId])

  const checkIfAnswered = useCallback(async () => {
    if (!gameState || !playerId) return

    try {
      const { data, error } = await supabase
        .from('responses')
        .select('id, answer')
        .eq('player_id', playerId)
        .eq('question_number', gameState.game.current_question)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking if answered:', error)
        return
      }

      if (data) {
        setHasAnswered(true)
        setSelectedAnswer(data.answer)
      } else {
        setHasAnswered(false)
        setSelectedAnswer(null)
      }
    } catch (error) {
      console.error('Error checking answer status:', error)
    }
  }, [gameState, playerId])

  // Initial data fetch
  useEffect(() => {
    fetchGameData()
  }, [fetchGameData])

  // Check answer status when game state changes
  useEffect(() => {
    if (gameState && playerId) {
      setTimeout(checkIfAnswered, 100)
    }
  }, [gameState?.game?.current_question, checkIfAnswered])

  // Smart polling system based on game status
  useEffect(() => {
    if (!gameState) return

    const getPollingInterval = () => {
      // No polling if page not visible
      if (document.visibilityState !== 'visible') return null
      
      if (gameState.game.status === 'waiting' || gameState.game.status === 'finished') {
        return 10000 // Slow for static states
      }
      
      if (gameState.game.status === 'answering') {
        return hasAnswered ? 2000 : 5000 // Fast if answered, moderate if still answering
      }
      
      if (gameState.game.status === 'revealing') {
        return 2000 // Fast - waiting for next question
      }
      
      return 10000 // Fallback
    }

    const interval = getPollingInterval()
    
    if (!interval) {
      return // No polling if page not visible
    }

    const pollInterval = setInterval(() => {
      fetchGameData()
    }, interval)

    return () => clearInterval(pollInterval)
  }, [gameState?.game?.status, hasAnswered, fetchGameData])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Immediate refresh when page becomes visible
        fetchGameData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchGameData])

  // Realtime subscriptions (primary method)
  useEffect(() => {
    const channel = supabase
      .channel(`player-${playerId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games', filter: `room_code=eq.${roomCode}` },
        fetchGameData
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `id=eq.${playerId}` },
        fetchGameData
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'responses' },
        checkIfAnswered
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode, playerId, fetchGameData, checkIfAnswered])

  const submitAnswer = async (answerIndex: number) => {
    if (hasAnswered || !gameState) return

    setSelectedAnswer(answerIndex)
    setHasAnswered(true)

    try {
      const result = await gameEngine.submitAnswer(
        playerId, 
        gameState.game.current_question, 
        answerIndex
      )
      
      console.log('Answer result:', result)
      
      // Update player data immediately for better UX
      if (result.isCorrect && playerData) {
        setPlayerData({
          ...playerData,
          score: playerData.score + result.pointsEarned
        })
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      
      if (error instanceof Error && error.message.includes('already answered')) {
        // Keep the UI showing "answered" state
      } else {
        // Other errors - allow retry
        setSelectedAnswer(null)
        setHasAnswered(false)
        alert('Erreur - veuillez réessayer')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <div className="text-xl">Connexion au jeu...</div>
          <div className="text-sm text-gray-400 mt-2">Room: {roomCode}</div>
        </div>
      </div>
    )
  }

  if (!gameState || !playerData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-400">Erreur de connexion</div>
          <div className="text-sm text-gray-400 mt-2">Impossible de charger les données</div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[gameState.game.current_question - 1]

  // Waiting for game to start
  if (gameState.game.status === 'waiting') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <WaitingScreen 
          type="game-start"
          playerName={playerData.name}
          currentScore={playerData.score}
          totalPlayers={gameState.totalPlayers}
        />
      </div>
    )
  }

  // Game finished
  if (gameState.game.status === 'finished' || !currentQuestion) {
    const playerRank = gameState.players.findIndex((p: any) => p.id === playerId) + 1
    
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <WaitingScreen 
          type="game-finished"
          playerName={playerData.name}
          currentScore={playerData.score}
          playerRank={playerRank}
        />
      </div>
    )
  }

  // Game in progress - answering phase
  if (gameState.game.status === 'answering') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-md mx-auto">
          <PlayerStats 
            playerName={playerData.name}
            currentScore={playerData.score}
            questionNumber={gameState.game.current_question}
          />

          <div className="mb-6">
            <QuestionDisplay 
              question={currentQuestion}
              size="mobile"
              showAnswers={false}
            />
          </div>

          <AnswerButtons 
            answers={currentQuestion.answers}
            onAnswerSelect={submitAnswer}
            selectedAnswer={selectedAnswer}
            disabled={hasAnswered}
          />

          {hasAnswered && (
            <div className="text-center">
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-green-400 font-medium">✓ Réponse enregistrée !</div>
                <div className="text-gray-400 text-sm mt-1">
                  En attente des autres joueurs...
                </div>
              </div>
            </div>
          )}

          {!hasAnswered && (
            <div className="text-center text-gray-400 text-sm">
              <p>Sélectionnez votre réponse</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Game in progress - revealing phase
  if (gameState.game.status === 'revealing') {
    const isCorrect = selectedAnswer !== null && selectedAnswer === currentQuestion.correct
    
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-md mx-auto">
          <PlayerStats 
            playerName={playerData.name}
            currentScore={playerData.score}
            questionNumber={gameState.game.current_question}
          />

          <div className="mb-6">
            <QuestionDisplay 
              question={currentQuestion}
              size="mobile"
              showAnswers={false}
            />
          </div>

          {/* Show player's answer and result */}
          <div className="mb-6">
            <div className={`p-4 rounded-lg text-center ${
              isCorrect ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'
            }`}>
              {hasAnswered && selectedAnswer !== null ? (
                <>
                  <div className="text-lg font-bold mb-2">
                    Votre réponse : {currentQuestion.answers[selectedAnswer]}
                  </div>
                  <div className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? '✓ Correct !' : '✗ Incorrect'}
                  </div>
                  {isCorrect && (
                    <div className="text-green-300 mt-2">
                      +{currentQuestion.value.toLocaleString()} leads
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-400">
                  Vous n&apos;avez pas répondu à temps
                </div>
              )}
            </div>
          </div>

          {/* Show correct answer */}
          <div className="mb-6 p-4 bg-slate-800 rounded-lg text-center">
            <div className="text-sm text-gray-400 mb-2">Bonne réponse :</div>
            <div className="text-lg font-bold text-orange-500 mb-2">
              {currentQuestion.answers[currentQuestion.correct]}
            </div>
            <div className="text-sm text-gray-300">
              {currentQuestion.explanation}
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm">
            <p>En attente de la question suivante...</p>
          </div>
        </div>
      </div>
    )
  }

  // Fallback
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl">État du jeu inconnu</div>
        <div className="text-sm text-gray-400 mt-2">Status: {gameState.game.status}</div>
      </div>
    </div>
  )
}