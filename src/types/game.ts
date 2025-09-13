export interface Game {
  id: string
  room_code: string
  status: 'waiting' | 'playing' | 'finished'
  current_question: number
  created_at: string
}

export interface Player {
  id: string
  game_id: string
  name: string
  email?: string
  score: number
  joined_at: string
}