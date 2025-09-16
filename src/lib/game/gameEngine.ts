// lib/game/gameEngine.ts - VERSION NETTOYÉE
import { supabase } from '@/lib/supabase'
import { questions } from './questions'
import type { Game, Player } from '@/types/game'

export class GameEngine {
  private gameId: string | null = null
  private roomCode: string | null = null

  // Génère un code de room unique
  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Crée une nouvelle partie
  async createGame(): Promise<{ roomCode: string; gameId: string }> {
    const roomCode = this.generateRoomCode()
    
    const { data, error } = await supabase
      .from('games')
      .insert({
        room_code: roomCode,
        status: 'waiting',
        current_question: 1
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create game: ${error.message}`)
    }

    this.gameId = data.id
    this.roomCode = roomCode
    
    return { roomCode, gameId: data.id }
  }

  // Rejoindre une partie
  async joinGame(roomCode: string, playerName: string, email?: string): Promise<string> {
    // 1. Vérifier que la game existe
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('room_code', roomCode)
      .single()

    if (gameError || !game) {
      throw new Error('Game not found')
    }

    // 2. Ajouter le joueur
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        game_id: game.id,
        name: playerName,
        email: email || null,
        score: 0
      })
      .select()
      .single()

    if (playerError) {
      throw new Error(`Failed to join game: ${playerError.message}`)
    }

    return player.id
  }

  // Obtenir l'état actuel du jeu
  async getGameState(roomCode: string): Promise<{
    game: Game
    players: Player[]
    currentQuestion: any
    totalPlayers: number
  }> {
    // 1. Info du jeu
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('room_code', roomCode)
      .single()

    if (gameError || !game) {
      throw new Error('Game not found')
    }

    // 2. Joueurs
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', game.id)
      .order('score', { ascending: false })

    if (playersError) {
      throw new Error('Failed to fetch players')
    }

    // 3. Question actuelle
    const currentQuestion = questions[game.current_question - 1] || null

    return {
      game,
      players: players || [],
      currentQuestion,
      totalPlayers: players?.length || 0
    }
  }

  // Commencer le jeu
  async startGame(roomCode: string): Promise<void> {
    await supabase
      .from('games')
      .update({ status: 'answering' })
      .eq('room_code', roomCode)
  }

  // Vérifier combien de joueurs ont répondu à la question courante
  async getAnswerStats(roomCode: string): Promise<{
    totalPlayers: number;
    playersAnswered: number;
    allAnswered: boolean;
  }> {
    // 1. Récupérer le jeu et la question courante
    const { data: game } = await supabase
      .from('games')
      .select('id, current_question')
      .eq('room_code', roomCode)
      .single()

    if (!game) {
      return { totalPlayers: 0, playersAnswered: 0, allAnswered: false }
    }

    // 2. Compter le total de joueurs
    const { count: totalPlayers } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', game.id)

    // 3. Compter les joueurs qui ont répondu à cette question
    const { count: playersAnswered } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', game.id)
      .eq('question_number', game.current_question)

    return {
      totalPlayers: totalPlayers || 0,
      playersAnswered: playersAnswered || 0,
      allAnswered: (playersAnswered || 0) >= (totalPlayers || 0) && totalPlayers! > 0
    }
  }

  // Timeout automatique des non-répondants (appelée par le host timer)
  async timeoutNonRespondents(roomCode: string): Promise<void> {
    try {
      console.log('⏰ Timeout triggered by host for room:', roomCode)

      const { data: game } = await supabase
        .from('games')
        .select('id, current_question')
        .eq('room_code', roomCode)
        .single()

      if (!game) throw new Error('Game not found')

      const { data: players } = await supabase
        .from('players')
        .select('id, name')
        .eq('game_id', game.id)

      if (!players || players.length === 0) return

      const { data: responses } = await supabase
        .from('responses')
        .select('player_id')
        .eq('question_number', game.current_question)
        .eq('game_id', game.id)

      const answeredPlayerIds = new Set(responses?.map(r => r.player_id) || [])
      const latecomers = players.filter(player => !answeredPlayerIds.has(player.id))

      console.log(`💔 ${latecomers.length} players were too slow`)

      // Créer des réponses "timeout" pour les retardataires
      if (latecomers.length > 0) {
        const timeoutResponses = latecomers.map(player => ({
          game_id: game.id,
          player_id: player.id,
          question_number: game.current_question,
          answer: -1, // -1 = TIMEOUT
          is_correct: false
        }))

        await supabase.from('responses').insert(timeoutResponses)
      }

      // Passer le jeu en mode "revealing"
      await supabase
        .from('games')
        .update({ status: 'revealing' })
        .eq('room_code', roomCode)

      console.log('✅ Timeout completed, game now in revealing mode')

    } catch (error) {
      console.error('❌ Error during timeout:', error)
      
      // Au minimum, changer le statut pour pas bloquer
      await supabase
        .from('games')
        .update({ status: 'revealing' })
        .eq('room_code', roomCode)
    }
  }

  // Passer à la question suivante
  async nextQuestion(roomCode: string): Promise<boolean> {
    const { data: game } = await supabase
      .from('games')
      .select('current_question')
      .eq('room_code', roomCode)
      .single()

    if (!game) return false

    const nextQuestionNum = game.current_question + 1
    
    if (nextQuestionNum > 5) {
      await supabase
        .from('games')
        .update({ status: 'finished' })
        .eq('room_code', roomCode)
      return false
    }

    await supabase
      .from('games')
      .update({ 
        current_question: nextQuestionNum,
        status: 'answering'
      })
      .eq('room_code', roomCode)

    return true
  }

  // Soumettre une réponse
  async submitAnswer(playerId: string, questionNumber: number, answerIndex: number): Promise<{
    isCorrect: boolean;
    pointsEarned: number;
    correctAnswer: number;
  }> {
    // Vérifier si le joueur a déjà répondu
    const { data: existingResponse, error: checkError } = await supabase
      .from('responses')
      .select('id, answer')
      .eq('player_id', playerId)
      .eq('question_number', questionNumber)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Error checking existing response: ${checkError.message}`)
    }

    if (existingResponse) {
      if (existingResponse.answer === -1) {
        throw new Error('Time expired - you can no longer answer this question')
      } else {
        throw new Error('You have already answered this question')
      }
    }

    const question = questions[questionNumber - 1]
    if (!question) {
      throw new Error('Question not found')
    }

    const isCorrect = answerIndex === question.correct
    const pointsEarned = isCorrect ? question.value : 0

    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('game_id, score')
      .eq('id', playerId)
      .single()

    if (playerError || !player) {
      throw new Error('Player not found')
    }

    try {
      // Enregistrer la réponse
      const { error: responseError } = await supabase
        .from('responses')
        .insert({
          game_id: player.game_id,
          player_id: playerId,
          question_number: questionNumber,
          answer: answerIndex,
          is_correct: isCorrect
        })

      if (responseError) {
        if (responseError.code === '23505') {
          throw new Error('You have already answered this question')
        }
        throw new Error(`Failed to record response: ${responseError.message}`)
      }

      // Mettre à jour le score si correct
      if (isCorrect) {
        const newScore = player.score + pointsEarned
        const { error: updateError } = await supabase
          .from('players')
          .update({ score: newScore })
          .eq('id', playerId)

        if (updateError) {
          console.error('Error updating score:', updateError)
        }
      }

      return {
        isCorrect,
        pointsEarned,
        correctAnswer: question.correct
      }

    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Unknown error occurred')
    }
  }

  // Réinitialiser pour une nouvelle partie
  async resetGame(roomCode: string): Promise<void> {
    const { data: game } = await supabase
      .from('games')
      .select('id')
      .eq('room_code', roomCode)
      .single()

    if (!game) return

    // Reset les scores des joueurs
    await supabase
      .from('players')
      .update({ score: 0 })
      .eq('game_id', game.id)

    // Reset le jeu
    await supabase
      .from('games')
      .update({ 
        status: 'waiting',
        current_question: 1
      })
      .eq('room_code', roomCode)
  }
}

// Instance globale
export const gameEngine = new GameEngine()