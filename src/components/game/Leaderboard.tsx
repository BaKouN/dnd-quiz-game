import { Card } from '@/components/ui/Card'

interface Player {
  id: string
  name: string
  score: number
}

interface LeaderboardProps {
  players: Player[]
  currentPlayerId?: string
  maxPlayers?: number
}

export function Leaderboard({ players, currentPlayerId, maxPlayers }: LeaderboardProps) {
  const displayPlayers = maxPlayers ? players.slice(0, maxPlayers) : players
  
  if (players.length === 0) {
    return (
      <Card>
        <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
        <div className="text-gray-400 text-center">No players yet...</div>
      </Card>
    )
  }
  
  return (
    <Card className='mb-8'>
      <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
      <div className="space-y-2">
        {displayPlayers.map((player, index) => (
          <div 
            key={player.id} 
            className={`flex justify-between items-center p-2 rounded ${
              player.id === currentPlayerId ? 'bg-orange-500/20 border border-orange-500' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="font-bold text-orange-500 w-6">#{index + 1}</span>
              <span className={player.id === currentPlayerId ? 'font-bold' : ''}>
                {player.name}
                {player.id === currentPlayerId && ' (You)'}
              </span>
            </div>
            <span className="font-bold">
              {player.score.toLocaleString()} leads
            </span>
          </div>
        ))}
        
        {maxPlayers && players.length > maxPlayers && (
          <div className="text-center text-gray-400 text-sm pt-2">
            ... and {players.length - maxPlayers} more players
          </div>
        )}
      </div>
    </Card>
  )
}