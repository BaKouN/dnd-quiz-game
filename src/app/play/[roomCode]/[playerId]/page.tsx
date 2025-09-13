// app/play/[roomCode]/[playerId]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { gameEngine } from '@/lib/game/gameEngine'
import { questions } from '@/lib/game/questions'

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

  useEffect(() => {
    fetchGameData()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel(`player-${playerId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games', filter: `room_code=eq.${roomCode}` },
        () => {
          fetchGameData()
          // Reset answer state when question changes
          setSelectedAnswer(null)
          setHasAnswered(false)
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `id=eq.${playerId}` },
        fetchGameData
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode, playerId, fetchGameData])

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
      // Reset on error
      setSelectedAnswer(null)
      setHasAnswered(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
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
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-orange-500 mb-6">LEAD MILLIONAIRE</h1>
          
          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">En attente...</h2>
            <p className="text-gray-300">Le jeu va bientôt commencer !</p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded">
              <div className="text-lg font-medium">{playerData.name}</div>
              <div className="text-sm text-gray-400">Joueur connecté</div>
            </div>
            
            <div className="bg-slate-800 p-4 rounded">
              <div className="text-2xl font-bold text-orange-500">{playerData.score.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Leads actuels</div>
            </div>

            <div className="bg-slate-800 p-4 rounded">
              <div className="text-lg font-bold">{gameState.totalPlayers}</div>
              <div className="text-sm text-gray-400">Joueurs connectés</div>
            </div>
          </div>

          <div className="mt-8 text-gray-400 text-sm">
            <p>Attendez que l&apos;hôte démarre la partie...</p>
          </div>
        </div>
      </div>
    )
  }

  // Game finished
  if (gameState.game.status === 'finished' || !currentQuestion) {
    const playerRank = gameState.players.findIndex((p: any) => p.id === playerId) + 1
    
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-orange-500 mb-6">PARTIE TERMINÉE</h1>
          
          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <div className="text-4xl mb-4">🎉</div>
            <div className="text-xl font-bold mb-2">Félicitations !</div>
            <div className="text-gray-300">Vous avez terminé #{playerRank}</div>
          </div>

          <div className="bg-slate-800 p-4 rounded mb-6">
            <div className="text-3xl font-bold text-orange-500">{playerData.score.toLocaleString()}</div>
            <div className="text-gray-400">Leads gagnés</div>
          </div>

          <div className="text-gray-400 text-sm">
            <p>Merci d&apos;avoir participé !</p>
            <p className="mt-2">Quiz éducatif par DnD Workshop</p>
          </div>
        </div>
      </div>
    )
  }

  // Game in progress
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-400">Question {gameState.game.current_question}/5</div>
          <div className="text-lg font-medium">{playerData.name}</div>
          <div className="text-xl font-bold text-orange-500">{playerData.score.toLocaleString()} leads</div>
        </div>

        {/* Question */}
        <div className="bg-slate-800 p-6 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500 mb-3">
              {currentQuestion.value.toLocaleString()} LEADS
            </div>
            <div className="text-lg leading-relaxed">
              {currentQuestion.question}
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="space-y-3 mb-6">
          {currentQuestion.answers.map((answer, index) => {
            const isSelected = selectedAnswer === index
            const isDisabled = hasAnswered
            
            return (
              <button
                key={index}
                onClick={() => !isDisabled && submitAnswer(index)}
                disabled={isDisabled}
                className={`w-full p-4 rounded-lg text-left font-medium transition-all duration-200 ${
                  isDisabled 
                    ? isSelected 
                      ? 'bg-orange-500 text-white transform scale-105' 
                      : 'bg-slate-700 text-gray-400'
                    : 'bg-slate-800 text-white hover:bg-slate-700 active:transform active:scale-95'
                }`}
              >
                <span className="font-bold text-orange-500 mr-3 text-xl">
                  {'ABCD'[index]}
                </span>
                <span className="text-base">{answer}</span>
              </button>
            )
          })}
        </div>

        {/* Status */}
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