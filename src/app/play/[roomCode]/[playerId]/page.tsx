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
        // Joueur a déjà répondu
        setHasAnswered(true)
        setSelectedAnswer(data.answer)
      } else {
        // Nouvelle question ou pas encore répondu
        setHasAnswered(false)
        setSelectedAnswer(null)
      }
    } catch (error) {
      console.error('Error checking answer status:', error)
    }
  }, [gameState, playerId])

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

  useEffect(() => {
    fetchGameData()
  }, [fetchGameData])

  useEffect(() => {
    if (!gameState || !playerId) return

    // Check answer status whenever gameState changes
    const checkAnswer = async () => {
      try {
        const { data } = await supabase
          .from('responses')
          .select('id, answer')
          .eq('player_id', playerId)
          .eq('question_number', gameState.game.current_question)
          .maybeSingle()

        if (data) {
          setHasAnswered(true)
          setSelectedAnswer(data.answer)
        } else {
          setHasAnswered(false)
          setSelectedAnswer(null)
        }
      } catch (error) {
        console.error('Error checking answer:', error)
      }
    }

    checkAnswer()

    // Subscribe to realtime
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
        () => checkAnswer() // Wrapper pour éviter la Promise dans le callback
      )
      .subscribe()

    // ✅ Cleanup function synchrone
    return () => {
      supabase.removeChannel(channel) // Pas d'await ici
    }
  }, [gameState, playerId, roomCode, fetchGameData])

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
      
      // Show error message
      if (error instanceof Error && error.message.includes('already answered')) {
        alert('Vous avez déjà répondu à cette question !')
      } else {
        alert('Erreur lors de l\'envoi de la réponse')
      }
      
      // Reset on error only if it's not "already answered"
      if (!(error instanceof Error && error.message.includes('already answered'))) {
        setSelectedAnswer(null)
        setHasAnswered(false)
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

  // Game in progress
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <PlayerStats 
          playerName={playerData.name}
          currentScore={playerData.score}
          questionNumber={gameState.game.current_question}
        />

        {/* Question */}
        <QuestionDisplay 
          question={currentQuestion}
          size="mobile"
          showAnswers={false}
        />

        {/* Answers */}
        <AnswerButtons 
          answers={currentQuestion.answers}
          onAnswerSelect={submitAnswer}
          selectedAnswer={selectedAnswer}
          disabled={hasAnswered}
        />

        {/* Status */}
        {hasAnswered && (
          <WaitingScreen 
            type="next-question"
            playerName={playerData.name}
            currentScore={playerData.score}
            message="Réponse enregistrée ! En attente des autres joueurs..."
          />
        )}
      </div>
    </div>
  )
}