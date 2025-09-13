import { Card } from '@/components/ui/Card'

interface GameStatsProps {
  totalPlayers: number
  currentQuestion: number
  totalQuestions?: number
  gameStatus: string
}

export function GameStats({ 
  totalPlayers, 
  currentQuestion, 
  totalQuestions = 5, 
  gameStatus 
}: GameStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <Card className="text-center" padding="md">
        <div className="text-2xl font-bold">{totalPlayers}</div>
        <div className="text-gray-400">Players</div>
      </Card>
      
      <Card className="text-center" padding="md">
        <div className="text-2xl font-bold">{currentQuestion}/{totalQuestions}</div>
        <div className="text-gray-400">Question</div>
      </Card>
      
      <Card className="text-center" padding="md">
        <div className="text-2xl font-bold capitalize">{gameStatus}</div>
        <div className="text-gray-400">Status</div>
      </Card>
    </div>
  )
}