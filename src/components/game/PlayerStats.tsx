interface PlayerStatsProps {
  playerName: string
  currentScore: number
  questionNumber: number
  totalQuestions?: number
}

export function PlayerStats({ 
  playerName, 
  currentScore, 
  questionNumber, 
  totalQuestions = 5 
}: PlayerStatsProps) {
  return (
    <div className="text-center mb-6">
      <div className="text-sm text-gray-400">Question {questionNumber}/{totalQuestions}</div>
      <div className="text-lg font-medium">{playerName}</div>
      <div className="text-xl font-bold text-orange-500">
        {currentScore.toLocaleString()} leads
      </div>
    </div>
  )
}